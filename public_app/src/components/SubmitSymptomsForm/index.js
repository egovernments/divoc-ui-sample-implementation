import React, {useEffect, useState} from "react";
import "./index.css"
import axios from "axios";
import {pathOr} from "ramda";
import {CertificateDetailsPaths, SIDE_EFFECTS_DATA} from "../../constants";
import {useKeycloak} from "@react-keycloak/web";
import {useHistory} from "react-router-dom";
import {useTranslation} from "react-i18next";

const state = {
    ChoosePatient: "ChoosePatient",
    ShowPatientDetails: "ShowPatientDetails",
    CompletedMessage: "CompletedMessage"
};

export const SubmitSymptomsForm = (props) => {
    const history = useHistory();
    const {keycloak} = useKeycloak();
    const [patientSelected, setPatientSelected] = useState(-1);
    const [recipients, setRecipients] = useState([]);
    const [currentState, setCurrentState] = useState(state.ChoosePatient);
    const [confirmDetails, setConfirmDetails] = useState(false);
    const {t} = useTranslation();
    const stateDetails = {
        [state.ChoosePatient]: {
            subTitle: t('sideEffect.submitSymptom.choosePatient')
        },
        [state.ShowPatientDetails]: {
            subTitle: ""
        },
        [state.CompletedMessage]: {
            subTitle: ""
        }
    };
    useEffect(() => {
        let sideEffectsData = localStorage.getItem(SIDE_EFFECTS_DATA);
        if (sideEffectsData == null) {
            history.push("/feedback");
        } else {
            fetchPatients()
        }
    }, []);

    async function moveToNextState() {

        if (currentState === state.ChoosePatient) {
            if (patientSelected >= 0) {
                setCurrentState(state.ShowPatientDetails)
            }
        }
        if (currentState === state.ShowPatientDetails) {
            if (confirmDetails) {
                submitSymptoms()
            }
        }

        if (currentState === state.CompletedMessage) {
            keycloak.logout({redirectUri: window.location.origin + "/feedback"});
        }
    }

    async function submitSymptoms() {
        let sideEffectsData = localStorage.getItem(SIDE_EFFECTS_DATA);
        sideEffectsData = JSON.parse(sideEffectsData);
        //TODO: added empty symptom and response, min 2 array fields required for registry to work
        const sideEffectsResponse = Object.keys(sideEffectsData).map(key => ({
            symptom: key,
            response: sideEffectsData[key].toString()
        })).concat({symptom:"", response: ""});
        const reportSideEffects = {
            certificateId: recipients[patientSelected].certificateId,
            sideEffectsResponse: sideEffectsResponse
        };
        const config = {
            headers: {
                Authorization: `Bearer ${keycloak.token} `,
                "Content-Type": "application/json",
            },
        };
        await axios
            .post("/divoc/api/v1/report-side-effects", reportSideEffects, config)
            .then((res) => {
                setCurrentState(state.CompletedMessage);
                return res.data;
            }).catch((err) => {
                console.log(err)
            }).finally(() => {
                localStorage.removeItem(SIDE_EFFECTS_DATA);
            });
    }

    async function fetchPatients() {
        const userMobileNumber = keycloak.idTokenParsed.preferred_username;
        const config = {
            headers: {
                Authorization: `Bearer ${keycloak.token} `,
                "Content-Type": "application/json",
            },
        };
        const response = await axios
            .get("/divoc/api/v1/certificates", config)
            .then((res) => {
                return res.data;
            });
        setRecipients(response)
        if (response.length === 1) {
            setPatientSelected(0);
            setCurrentState(state.ShowPatientDetails);
        }
    }

    return (
        <div className="submit-symptoms-form">
            {
                currentState === state.CompletedMessage && <div>
                    <h5>{t('sideEffect.submitSymptom.completeMsgTitle')}</h5>
                    <h5>{t('sideEffect.submitSymptom.completeMsgTitle2')}</h5>
                    <h6 className="mt-5" style={{color: "#5C9EF8"}}>{t('sideEffect.submitSymptom.completeMsgSubTitle')}</h6>
                    <span className="mt-3 d-inline-block" style={{fontSize: '14px'}}>
                        {pathOr("NA", CertificateDetailsPaths["Vaccination Facility"].path, recipients[patientSelected].certificate)}
                        <br/>
                        {pathOr("", ["evidence", "0", "facility", "address", "streetAddress"], recipients[patientSelected].certificate)}
                        {", "}
                        {pathOr("", ["evidence", "0", "facility", "address", "district"], recipients[patientSelected].certificate)}
                        {", "}
                        {pathOr("", ["evidence", "0", "facility", "address", "addressRegion"], recipients[patientSelected].certificate)}
                        {", "}
                        {pathOr("", ["evidence", "0", "facility", "address", "addressCountry"], recipients[patientSelected].certificate)}
                    </span>
                    <br/>
                    {/*<span style={{fontSize: '14px'}}>{pathOr("NA", ["certificate", "facility", "contact"], recipients[patientSelected])}</span>*/}
                    <br/>
                    <button className="form-btn mt-5" onClick={moveToNextState}>{t('button.continue')}</button>
                </div>
            }
            {
                currentState !== state.CompletedMessage && <>
                    <h5 className="form-title">{t('sideEffect.submitSymptom.title')}</h5>
                    <span className="form-subtitle">{stateDetails[currentState].subTitle}</span>
                    {
                        currentState === state.ChoosePatient && <div>
                            {
                                recipients.map(({osid, certificate: {credentialSubject: {name, gender, age}}}, index) => (
                                    <div key={index} className="mt-2 d-flex align-items-center">
                                        <input type="radio" id={index} name="choose-recipient" className="mr-3"
                                               checked={patientSelected === index} onChange={() => {
                                            setPatientSelected(index)
                                        }}/>
                                        <label for={index}>
                                            <span style={{fontSize: "14px"}}>{name}</span><br/>
                                            <span style={{fontSize: "12px"}}>{gender}</span>, <span
                                            style={{fontSize: "12px"}}>{age || "NA"}</span>
                                        </label>
                                    </div>
                                ))
                            }
                            <button className="form-btn mt-3" onClick={moveToNextState}>{t('button.submit')}</button>
                        </div>
                    }
                    {
                        currentState === state.ShowPatientDetails &&
                        <>
                            <table className="patient-details-table">
                                {
                                    Object.keys(CertificateDetailsPaths).map((item, index) => {
                                        return (
                                            <tr>
                                                <td className="table-title">{t('certificate.'+item)}</td>
                                                <td className="table-value">{pathOr("NA", CertificateDetailsPaths[item].path, recipients[patientSelected].certificate)}</td>
                                            </tr>
                                        )
                                    })
                                }
                            </table>
                            <div className="confirmation-wrapper">
                                <input type="checkbox" id="confirm-wrapper" className="confirmation-checkbox"
                                       checked={confirmDetails} onChange={() => {
                                    setConfirmDetails(!confirmDetails)
                                }}/>
                                <label for={"confirm-wrapper"} className="confirmation-msg">
                                    {t('sideEffect.submitSymptom.confirmationMsg')}
                                </label>
                            </div>
                            <button className="form-btn" onClick={moveToNextState} disabled={!confirmDetails}>
                                {t('sideEffect.submitSymptom.confirmPatient')}
                            </button>
                        </>
                    }
                </>
            }
        </div>
    )
};
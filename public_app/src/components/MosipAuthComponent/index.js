import axios from "axios";
import { useState } from "react";
import { CustomButton } from "../CustomButton";
import './index.css';
import { Row } from "react-bootstrap";
import { ID_TYPES } from '../../utils/national-id';
import {useTranslation} from "react-i18next";

const MOSIP_GENERATE_OTP_API = '/divoc/api/citizen/external/mosip/generateOTP';

export function MosipAuthComponent(props) {
    const [individualId, setIndividualId] = useState("")
    const [individualIdType, setIndividualIdType] = useState("VID");
    const [error, setError] = useState(null);
    const [consentProvided, setConsentProvided] = useState(false);
    const [isOTPGenerated, setIsOTPGenerated] = useState(false);
    const [otp, setOtp] = useState("");
    const mosip = ID_TYPES.filter(idType => idType.id === 'mosip')[0];
    const { t } = useTranslation();

    const formatMosipResponse = (res) => {
        const formattedRes = {}
        formattedRes['name'] = res.name_eng;
        formattedRes['phone'] = res.phoneNumber;
        formattedRes['pincode'] = res.postalCode;
        formattedRes['gender'] = res.gender_eng;
        formattedRes['email'] = res.emailId;
        formattedRes['dob'] = res.dob;
        formattedRes['district'] = res.location2_eng;
        formattedRes['state'] = res.location3_eng;
        return formattedRes;
    }

    const onGenerateOTP = () => {
        setError(null);
        if(individualId === "") {
            setError(t('errors.mosipIndividualIDRequired'));
            return;
        }
        if(consentProvided) {
            var regExp = /[a-zA-Z]/g;
            if(!regExp.test(individualId)) {
                axios.post(MOSIP_GENERATE_OTP_API, JSON.stringify({individualId, individualIdType}), {
                    headers: {
                        'Content-Type': 'application/json',
                        'accept': 'application/json'
                    }
                })
                .then(async(res) => {
                    if(res.status === 200) {
                        setIsOTPGenerated(true);
                        return;
                    }
                    setError(res.data);
                })
                .catch((e) => {
                    setError(e.response.data);
                });
            } else {
                setError(t('errors.invalidId'));
            }
        }
        else {
            setError(t('errors.consentNotProvided'));
        }
    }

    const onGetKyc = () => {
        if(otp === "") {
            setError(t('errors.mosipOtpRequired'));
            return;
        }
        const url = '/divoc/api/citizen/external/mosip/kyc';
        setError(null);
        axios.post(url, {individualId, individualIdType, otp}, {headers: {
            'Content-Type': 'application/json',
            'accept': 'application/json'
        }}).then((response) => {
            if(response.status === 200) {
                const kycData = formatMosipResponse(response.data);
                props.updateFormData({...kycData, identity: "did:"+mosip.value+":"+individualId});
                return;
            }
            setError(response.data);
        }).catch(err => {
            setError(err.response.data);
        })
    }

    return (
        <div className="mosip-auth-container">
            {!isOTPGenerated && 
                <div>
                    <p style={{fontSize:"large", textAlign: 'center'}}> {t('registration.formDetails.mosipIndividualIdType')} </p>
                    <div className="mosip-auth-radio">
                        <div>
                            <input
                                type="radio"
                                className="mosip-auth-input" 
                                checked={individualIdType === 'VID'} 
                                onChange={(e) => setIndividualIdType(e.target.value)} 
                                value="VID" 
                            /> {t('registration.formDetails.mosipVid')}
                        </div>
                        <div>
                            <input 
                                type="radio"
                                className="mosip-auth-input"
                                checked={individualIdType === 'UIN'}
                                onChange={(e) => setIndividualIdType(e.target.value)}
                                value="UIN"
                            /> {t('registration.formDetails.mosipUin')}
                        </div>
                    </div>
                    <div>
                    <input className="form-control form-control-lg mosip-individual-id" type="text" value={individualId}
                                onChange={(evt) => setIndividualId(evt.target.value)} autoFocus={true}
                                placeholder="Enter Individual ID" required/>
                        {
                            error && <div className="mosip-auth-error">
                            {error}
                            </div>
                        }
                        <CustomButton className={"blue-btn w-100"} onClick={onGenerateOTP}>GET OTP</CustomButton>
                        <input type="checkbox" className="mosip-consent" onChange={(e) => setConsentProvided(e.target.checked)}/>
                        <span style={{'marginLeft': '20px', marginBottom: '20px'}}> {t('registration.formDetails.mosipKycConsent')}</span>
                    </div>
                </div>
            }
            {
                isOTPGenerated && 
                <div>
                    <Row>
                        <div className="form-group col-md-6">
                            <input className="form-control form-control-lg" type="text" value={individualId} disabled={isOTPGenerated}/>
                        </div>
                        <div className="form-group col-md-6">
                            <input className="form-control form-control-lg" required placeholder="OTP" type="text" value={otp} onChange={(e) => setOtp(e.target.value)}/>
                        </div>
                    </Row>
                    {error && <div className="mosip-auth-error">
                            {error}
                            </div>}
                    <Row>
                        <CustomButton className={"blue-btn w-60"} style={{'margin': 'auto'}} onClick={onGetKyc} >VERIFY</CustomButton>
                    </Row>
                </div>
            }
        </div>
    )
}
import { BaseFormCard } from "components/BaseFormCard"
import { CustomButton } from "components/CustomButton"
import { FORM_WALK_IN_MOSIP_ENROLL_FORM, FORM_WALK_IN_VERIFY_OTP, useWalkInEnrollment } from "components/WalkEnrollments/context";
import { ApiServices } from "Services/ApiServices";
import {getMessageComponent, LANGUAGE_KEYS} from "../../lang/LocaleContext";
import "./index.css";
import {ID_TYPES} from '../../utils/national-id';

const { useState, useEffect } = require("react")

export const MosipAuth = () => {

    const [individualId, setIndividualId] = useState("")
    const [individualIdType, setIndividualIdType] = useState("VID");
    const [isOTPGenerated, setIsOTPGenerated] = useState(false);
    const [error, setError] = useState(null);
    const {goNext} = useWalkInEnrollment();
    const [maskedEmail, setMaskedEmail] = useState('');
    const [maskedMobile, setMaskedMobile] = useState('');
    const [consentProvided, setConsentProvided] = useState(false);
    const mosip = ID_TYPES.filter(idType => idType.id === 'mosip')[0];
    useEffect(() => {
        if(isOTPGenerated) {
            goNext(FORM_WALK_IN_MOSIP_ENROLL_FORM, FORM_WALK_IN_VERIFY_OTP, {identity: "did:"+mosip.value+ ":" + individualId, individualIdType, from: 'mosip', phone: maskedMobile, maskedEmail});
        }
    }, [isOTPGenerated]);

    const onGenerateOTP = () => {
        if(consentProvided) {
            var regExp = /[a-zA-Z]/g;
            if(!regExp.test(individualId)) {
                ApiServices.generateMosipOTP({individualId, individualIdType})
                    .then(async(res) => {
                        if(res.status === 200) {
                            res = await res.json();
                            setMaskedEmail(res.maskedEmail);
                            setMaskedMobile(res.maskedMobile);
                            setIsOTPGenerated(true);
                            return;
                        }
                        setIsOTPGenerated(false);
                        res.json().then(res => setError(res))
                    })
                    .catch((e) => {
                        setIsOTPGenerated(false);
                    });
            } else {
                setError('Invalid ID');
            }
        }
        else {
            setError('Please provide consent to use phone number');
        }
    }

    return <div className="new-enroll-container">
        <BaseFormCard title={getMessageComponent(LANGUAGE_KEYS.ENROLLMENT_TITLE)}>
            <div className="verify-mobile-container">
                <h5>Verify with Mosip</h5>
                <h5>Select Individual Type</h5>
                <div style={{'marginTop': '20px','display': 'flex', 'justifyContent': 'space-evenly'}}>
                    <div>
                        <input
                            type="radio"
                            className="mosip-auth-input" 
                            checked={individualIdType === 'VID'} 
                            onChange={(e) => setIndividualIdType(e.target.value)} 
                            value="VID" 
                        /> Enter VID
                    </div>
                    <div>
                        <input 
                            type="radio"
                            className="mosip-auth-input"
                            checked={individualIdType === 'UIN'}
                            onChange={(e) => setIndividualIdType(e.target.value)}
                            value="UIN"
                        /> Enter UIN
                    </div>
                </div>
                <input className="w-100 mt-5 mb-3 mobile-input" type="text" value={individualId}
                        onChange={(evt) => setIndividualId(evt.target.value)} autoFocus={true}
                        placeholder="Enter Individual ID"/>
                {
                    error && <div className="mosip-auth-error">
                    {error}
                    </div>
                }
                <CustomButton className='primary-btn w-100' onClick={onGenerateOTP}>GET OTP</CustomButton>
                <div style={{'float': 'left'}}><input type="checkbox" style={{'marginRight': '20px'}} required onChange={(e) => setConsentProvided(e.target.checked)}/>I hearby have taken consent of beneficiary to use his KYC information for the purpose of registering for vaccination program.</div>
            </div>
        </BaseFormCard>
    </div>
}
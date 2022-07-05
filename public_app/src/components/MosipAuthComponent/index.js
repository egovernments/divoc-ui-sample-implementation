import axios from "axios";
import { useEffect } from "react";
import { useState } from "react";
import { CustomButton } from "../CustomButton";
import './index.css';
import {useHistory} from 'react-router-dom';
const MOSIP_GENERATE_OTP_API = '/divoc/api/citizen/external/mosip/generateOTP';

export function MosipAuthComponent() {
    const [individualId, setIndividualId] = useState("")
    const [individualIdType, setIndividualIdType] = useState("VID");
    const [error, setError] = useState(null);
    const [consentProvided, setConsentProvided] = useState(false);
    const [isOTPGenerated, setIsOTPGenerated] = useState(false);
    const [maskedEmail, setMaskedEmail] = useState('');
    const [maskedMobile, setMaskedMobile] = useState('');
    const history = useHistory();

    function onGenerateOTP() {
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
                        history.push({pathname: '/citizen', state: {individualId, individualIdType, from: 'mosip', emailId: res.data.maskedEmail, mobileNumber: res.data.maskedMobile}});
                        return;
                    }
                    setIsOTPGenerated(false);
                    res.json().then(res => setError(res))
                })
                .catch((e) => {
                    setIsOTPGenerated(false);
                });
                // history.push({pathname: '/citizen', state: {individualId, individualIdType, from: 'mosip'}});
            } else {
                setError('Invalid ID');
            }
        }
        else {
            setError('Please provide consent to use phone number');
        }
    }

    return (
        <div className="mosip-auth-container">
            <h5 className="mb-5 mt-5" style={{fontWeight:"bold"}}>Verify with Mosip</h5>
            <h5 className="mb-5" style={{fontSize:"large"}}>Select Individual Type</h5>
            <div className="mosip-auth-radio">
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
            <div>
            <input className="form-control form-control-lg" type="text" value={individualId}
                        onChange={(evt) => setIndividualId(evt.target.value)} autoFocus={true}
                        placeholder="Enter Individual ID"/>
                {
                    error && <div className="mosip-auth-error">
                    {error}
                    </div>
                }
                <CustomButton className={"blue-btn w-100"} onClick={onGenerateOTP}>GET OTP</CustomButton>
                <div style={{'float': 'left'}}><input type="checkbox" style={{'marginRight': '20px'}} required onChange={(e) => setConsentProvided(e.target.checked)}/>I hereby have taken consent of the beneficiary to use their KYC information for the purpose of registering in the vaccination program.</div>
            </div>
        </div>
    )
}
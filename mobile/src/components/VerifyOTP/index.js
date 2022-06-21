import React, {useEffect, useState} from "react";
import {BaseFormCard} from "../BaseFormCard";
import {getMessageComponent, LANGUAGE_KEYS} from "../../lang/LocaleContext";
import "./index.css";
import {CustomButton} from "../CustomButton";
import {useWalkInEnrollment} from "../WalkEnrollments/context";
import {FORM_WALK_IN_ENROLL_FORM, FORM_WALK_IN_VERIFY_OTP} from "../WalkEnrollments/context";
import OtpInput from "react-otp-input";
import { ApiServices } from "Services/ApiServices";
import decode from "jwt-decode";

export const VerifyOTP = ({state}) => {
    const [otp, setOTP] = useState("");
    const [errors, setErrors] = useState({});
    const {goNext} = useWalkInEnrollment();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [mobileNumber, setMobileNumber] = useState('');

    useEffect(() => {
        if(isAuthenticated) {
            goNext(FORM_WALK_IN_VERIFY_OTP, FORM_WALK_IN_ENROLL_FORM, {phone: mobileNumber});
        }
    })

    function onVerifyOTP() {
        if(state.from === 'mosip') {
            const individualId = state.individualId;
            const individualIdType = state.individualIdType;
            ApiServices.verifyMosipOTP({individualId, individualIdType, otp})
                .then(async(res) => {
                    if(res.status === 200) {
                        res = await res.json();
                        const decodedToken = decode(res.token);
                        setMobileNumber(decodedToken.Phone? decodedToken.Phone: '');
                        setIsAuthenticated(true); 
                        return;
                    }
                    res.json().then(err => setErrors({otp: err}));
                });
        }
        else if (otp === "123456") {
            goNext(FORM_WALK_IN_VERIFY_OTP, FORM_WALK_IN_ENROLL_FORM, {})
        } else {
            setErrors({otp: "Invalid OTP"})
        }
    }

    return (
        <div className="new-enroll-container">
            <BaseFormCard title={getMessageComponent(LANGUAGE_KEYS.ENROLLMENT_TITLE)}>
                <div className="verify-mobile-container">
                    <h5>Enter OTP</h5>
                    {state.phone && <div>OTP sent to {'+XX XXXXXX'.concat(state.phone.substring(6))}</div>}
                    {state.maskedEmail && <div>OTP sent to {state.maskedEmail}</div>}
                    <OtpInput
                        value={otp}
                        onChange={(data) => {
                            setErrors({})
                            setOTP(data)
                        }}
                        numInputs={6}
                        containerStyle="justify-content-around mt-5 mb-3"
                        inputStyle={`otp-input ${"otp" in errors ? "otp-error" : ""}`}
                        separator={""}
                        isInputSecure={true}
                        isInputNum={true}
                        shouldAutoFocus={true}
                        // hasErrored={true}
                    />
                    <div className="invalid-input m-0 text-left">
                        {errors.otp}
                    </div>
                    <CustomButton className="primary-btn w-100" onClick={onVerifyOTP}>VERIFY</CustomButton>
                </div>
            </BaseFormCard>
        </div>
    )
};
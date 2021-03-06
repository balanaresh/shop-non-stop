import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import './SignIn.scss';
import SIGN_IN_FORM_CONFIG from '../../assets/config/sign-in-form';
import FormInput from '../../components/UI/FormInput/FormInput';
import Button from '../../components/UI/Button/Button.jsx';
import * as authActionCreators from '../../redux/actions/authAction';

class SignIn extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            signInForm: SIGN_IN_FORM_CONFIG,
            isFormValid: false
        };
    }

    inputFocusHandler = (event, elementKey) => {
        this.setState({
            signInForm: {
                ...this.state.signInForm,
                [elementKey]: {
                    ...this.state.signInForm[elementKey],
                    status: {
                        ...this.state.signInForm[elementKey].status,
                        isValid: true,
                        isTouched: true
                    }
                }
            }
        });
    };

    inputBlurHandler = (event, elementKey) => {
        const [validity, errMsg] = this.checkElementValidity(this.state.signInForm[elementKey].validations, event.target.value);

        this.setState({
            signInForm: {
                ...this.state.signInForm,
                [elementKey]: {
                    ...this.state.signInForm[elementKey],
                    status: {
                        ...this.state.signInForm[elementKey].status,
                        isValid: validity
                    },
                    errorMessage: errMsg
                }
            }
        });
    };

    inputChangeHandler = (event, elementKey) => {
        const inputValue = event.target.value.trimStart();
        const [validity, errMsg] = this.checkElementValidity(this.state.signInForm[elementKey].validations, inputValue);

        this.setState({
            signInForm: {
                ...this.state.signInForm,
                [elementKey]: {
                    ...this.state.signInForm[elementKey],
                    properties: {
                        ...this.state.signInForm[elementKey].properties,
                        value: inputValue
                    },
                    status: {
                        ...this.state.signInForm[elementKey].status,
                        isValid: validity
                    },
                    errorMessage: errMsg
                }
            }
        }, () => {
            const formValidity = this.checkFormValidity();
            this.setState({
                isFormValid: formValidity
            });
        });
    };

    checkElementValidity = (validations, inputValue) => {
        let isValid = true;
        let errMsg = '';
        for (let rule in validations) {
            switch (rule) {
                case 'required':
                    isValid = inputValue ? true : false;
                    if (!isValid) errMsg = 'Required';
                    break;
                case 'minLength':
                    isValid = inputValue.length >= validations[rule];
                    if (!isValid) errMsg = `Minimum length ${validations[rule]} is required`;
                    break;
                case 'maxLength':
                    isValid = inputValue.length <= validations['maxLength'];
                    if (!isValid) errMsg = `Maximum character limit: ${validations['maxLength']}`;
                    break;
                case 'regex':
                    isValid = validations[rule].test(inputValue);
                    if (!isValid) errMsg = `Invalid`;
                    break;
                default:
                    isValid = 'true';
                    errMsg = '';
            }
            if (!isValid) return [isValid, errMsg];
        }
        return [isValid, errMsg];
    };

    checkFormValidity = () => {
        let isValid = true;
        for (let element in this.state.signInForm) {
            if (!this.state.signInForm[element].status.isValid) {
                isValid = false;
                return isValid;
            }
        }
        return isValid;
    };

    formSubmitHandler = async event => {
        let inputValues = {};
        for (let el in this.state.signInForm) {
            inputValues[el] = this.state.signInForm[el].properties.value;
        }
        this.props.signIn(inputValues.email, inputValues.password, this.props.history);
        this.resetFormHandler();
    };

    resetFormHandler = () => {
        this.setState({
            signInForm: {
                ...this.state.signInForm,
                email: {
                    ...this.state.signInForm.email,
                    properties: {
                        ...this.state.signInForm.email.properties,
                        value: ''
                    },
                    status: {
                        ...this.state.signInForm.email.status,
                        isValid: false,
                        isTouched: false
                    }
                },
                password: {
                    ...this.state.signInForm.password,
                    properties: {
                        ...this.state.signInForm.password.properties,
                        value: ''
                    },
                    status: {
                        ...this.state.signInForm.password.status,
                        isValid: false,
                        isTouched: false
                    }
                }
            },
            isFormValid: false
        });
    };

    render() {
        let formElements = [];
        for (let el in this.state.signInForm) {
            formElements.push({
                key: el,
                ...this.state.signInForm[el]
            });
        }
        return (
            <div className="sign-in">
                <h2>I already have an account</h2>
                <h4>Sign in with your email and password.</h4>
                <form>
                    {
                        formElements.map(el => (
                            <FormInput
                                key={el.key}
                                label={el.label}
                                properties={el.properties}
                                status={el.status}
                                errorMessage={el.errorMessage}
                                handleFocus={event => this.inputFocusHandler(event, el.key)}
                                handleBlur={event => this.inputBlurHandler(event, el.key)}
                                handleChange={event => this.inputChangeHandler(event, el.key)}
                            />
                        ))
                    }
                    <div className="buttons">
                        <Button disable={!this.state.isFormValid} clickHandler={this.formSubmitHandler}>Sign In</Button>
                        <Button clickHandler={this.resetFormHandler}>Reset</Button>
                        <Button clickHandler={() => this.props.googleSignIn(this.props.history)} isThirdPartySignInButton>Sign In With Google</Button>
                    </div>
                </form>
            </div>
        );
    }
}

const mapDispatchToProps = dispatch => {
    return {
        signIn: (email, password, history) => dispatch(authActionCreators.signIn(email, password, history)),
        googleSignIn: history => dispatch(authActionCreators.googleSignIn(history))
    };
};

export default withRouter(connect(null, mapDispatchToProps)(SignIn));
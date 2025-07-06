import React from 'react';
import sideImage from '../assets/LoginSideBar.avif';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Loading from '../components/common/Loading.jsx';
import Button from '../components/common/Button.jsx';
import FormInput from '../components/common/FormInput.jsx';
import { authUser } from '../services/auth.js';
import { UseAuthStore } from '../stores/UseAuthStore.jsx';

const Login = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const loginStore = UseAuthStore((state) => state.loginStore); // stores user auth info in zustand/localstorage

    const schema = yup.object({
        email: yup
            .string()
            .trim()
            .email('Invalid email format')
            .required('Email is required.'),
        password: yup.string().required('Password is required'),
    });

    const {
        register,
        reset,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
    });

    const onSubmit = async (data) => {
        console.log('Form Data:', data);

        try {
            setLoading(true);
            const res = await authUser('login', data);
            const resData = await res.json();

            if (!res.ok) {
                toast.error(resData.message);
                return;
            }

            toast.success(resData.message);
            loginStore(resData.user);
            reset();
            navigate('/');
        } catch (error) {
            toast.error(error.message || 'Something went wrong!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {loading && <Loading />}
            <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
                <div className="flex flex-col md:flex-row w-full max-w-4xl bg-white rounded-xl overflow-hidden shadow-lg">
                    {/* Left Image Section */}
                    <div className="hidden md:flex md:w-1/2 bg-[#0F172A] p-6 items-center justify-center">
                        <img
                            src={sideImage}
                            alt="Login Illustration"
                            className="w-[90%] object-contain"
                        />
                    </div>

                    {/* Right Form Section */}
                    <div className="w-full md:w-1/2 p-10">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                            Log in
                        </h2>
                        <p className="text-sm text-gray-600 mb-6">
                            Welcome back to WebTalk
                        </p>

                        {/* Form */}
                        <form onSubmit={handleSubmit(onSubmit)} noValidate>
                            {/* Email */}
                            <FormInput
                                label="Email"
                                placeholder="Enter Email"
                                type="text"
                                register={register}
                                errors={errors}
                                name="email"
                                icon={<FontAwesomeIcon icon={faEnvelope} />}
                            />

                            {/* Password */}
                            <FormInput
                                label="Password"
                                placeholder="Enter Password"
                                type="password"
                                register={register}
                                errors={errors}
                                name="password"
                            />

                            {/* Forgot Password */}
                            <div className="flex justify-end items-center mb-6">
                                <a
                                    href="#"
                                    className="text-sm text-blue-600 font-medium"
                                >
                                    Forgot Password?
                                </a>
                            </div>

                            {/* Submit Button */}
                            <Button type="submit" name="Sign In" />
                        </form>

                        {/* Divider */}
                        <div className="my-4 flex items-center">
                            <hr className="flex-grow border-t border-gray-300" />
                            <span className="mx-2 text-gray-400 text-sm">
                                or
                            </span>
                            <hr className="flex-grow border-t border-gray-300" />
                        </div>

                        {/* Sign Up Redirect */}
                        <Button
                            name="Log in"
                            color="black"
                            bgColor="white"
                            borderColor="black"
                            borderPx="001px"
                            onClick={() => navigate('/signup')}
                        />
                    </div>
                </div>
            </div>
        </>
    );
};

export default Login;

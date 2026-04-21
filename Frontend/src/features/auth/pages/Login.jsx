import React from "react";
import sideImage from "../../../assets/LoginSideBar.avif";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "@/components/ui/Button.jsx";
import Input from "@/components/ui/Input.jsx";
import { useAuthHandle } from "../hooks/useAuthForm.js";

const Login = () => {
    const navigate = useNavigate();
    const schema = yup.object({
        email: yup
            .string()
            .trim()
            .email("Invalid email format")
            .required("Email is required."),
        password: yup.string().required("Password is required"),
    });

    const {
        register,
        reset,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
    });

    const { onSubmit, loading } = useAuthHandle({ type: "login", reset });

    return (
        <>
            <div className='min-h-screen flex items-center justify-center bg-gray-100 px-4 '>
                <div className='flex flex-col md:flex-row w-full max-w-4xl bg-white rounded-xl overflow-hidden border border-zinc-200'>
                    {/* Left Image Section */}
                    <div className='hidden md:flex md:w-1/2 bg-[#0F172A] p-6 items-center justify-center'>
                        <img
                            src={sideImage}
                            alt='Login Illustration'
                            className='w-[90%] object-contain'
                        />
                    </div>

                    {/* Right Form Section */}
                    <div className='w-full md:w-1/2 p-10'>
                        <div className='mb-6'>
                            <h1 className='text-2xl font-semibold tracking-tight'>
                                Welcome back
                            </h1>
                            <p className='text-sm text-zinc-500 mt-1'>
                                Sign in to continue your conversations.
                            </p>
                        </div>

                        <form
                            className='space-y-4'
                            onSubmit={handleSubmit(onSubmit)}
                            noValidate
                        >
                            {/* Email */}
                            <Input
                                label={"Email"}
                                error={errors.email?.message}
                                {...register("email")}
                                type='email'
                                placeholder='you@example.com'
                            />

                            {/* Password */}
                            <Input
                                label={"Password"}
                                error={errors.password?.message}
                                {...register("password")}
                                type='password'
                                placeholder='••••••••'
                            />

                            {/* Submit Button */}
                            <Button
                                loading={loading}
                                className={"w-full"}
                                type='submit'
                            >
                                Login
                            </Button>
                        </form>

                        {/* Divider */}
                        <p className='text-sm text-center text-zinc-500  mt-6'>
                            Don’t have an account?
                            <Link
                                to='/signup'
                                className='ml-1 text-zinc-900  hover:underline'
                            >
                                Create one
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Login;

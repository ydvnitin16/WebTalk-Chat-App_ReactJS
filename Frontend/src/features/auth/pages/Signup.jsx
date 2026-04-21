import sideImage from "../../../assets/LoginSideBar.avif";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAt, faEnvelope, faUser } from "@fortawesome/free-solid-svg-icons";
import Input from "@/components/ui/Input.jsx";
import Button from "@/components/ui/Button.jsx";
import { useAuthHandle } from "../hooks/useAuthForm.js";

const Signup = () => {
    // Validation schema
    const schema = yup.object({
        name: yup.string().trim().required("Name is required"),
        username: yup
            .string()
            .trim()
            .min(3, "Username must be at least 3 characters")
            .matches(
                /^[a-z0-9_]+$/,
                "Username can only contain lowercase letters, numbers, and underscores",
            )
            .required("Username is required"),
        email: yup
            .string()
            .trim()
            .email("Invalid email format")
            .required("Email is required."),
        password: yup
            .string()
            .min(6, "Password must be at least 6 characters")
            .required("Password is required"),
    });

    const {
        register,
        reset,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
    });

    // Form submission
    const { onSubmit, loading } = useAuthHandle({ type: "register", reset });

    return (
        <>
            <div className='min-h-screen flex items-center justify-center bg-gray-100 px-4'>
                <div className='flex flex-col md:flex-row w-full max-w-5xl bg-white rounded-xl overflow-hidden border-zinc-200'>
                    {/* Left: Register Form */}
                    <div className='w-full md:w-1/2 p-8 sm:p-10'>
                        <div className='mb-6'>
                            <h1 className='text-2xl font-semibold tracking-tight'>
                                Create your account
                            </h1>
                            <p className='text-sm text-zinc-500 mt-1'>
                                Get start your conversations.
                            </p>
                        </div>

                        <form
                            className='space-y-4'
                            onSubmit={handleSubmit(onSubmit)}
                        >
                            {/* Name */}
                            <Input
                                label={"Name"}
                                error={errors.name?.message}
                                {...register("name")}
                                type='text'
                                placeholder='John Doe'
                            />

                            <Input
                                label='Username (Allows others to find you)'
                                error={errors.username?.message}
                                {...register("username")}
                                type='text'
                                placeholder='choose unique username'
                            />

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

                            {/* Register Button */}
                            <Button
                                loading={loading}
                                className={"w-full"}
                                type='submit'
                            >
                                Sign Up
                            </Button>
                        </form>

                        {/* FOOTER */}
                        <p className='text-sm text-center text-zinc-500  mt-6'>
                            Already have an account?
                            <Link
                                to='/signup'
                                className='ml-1 text-zinc-900  hover:underline'
                            >
                                Login
                            </Link>
                        </p>
                    </div>

                    {/* Banner Section */}
                    <div
                        className='hidden md:flex md:w-1/2 bg-cover bg-center text-white p-10 flex-col justify-center rounded-l-xl'
                        style={{
                            backgroundImage: `url(${sideImage})`,
                        }}
                    ></div>
                </div>
            </div>
        </>
    );
};

export default Signup;

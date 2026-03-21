import sideImage from "../../../assets/LoginSideBar.avif";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faUser } from "@fortawesome/free-solid-svg-icons";
import FormInput from "@/components/ui/FormInput.jsx";
import Button from "@/components/ui/Button.jsx";
import { useAuthHandle } from "../hooks/useAuthForm.js";

const Signup = () => {
    // Validation schema
    const schema = yup.object({
        name: yup.string().trim().required("Name is required"),
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
                <div className='flex flex-col md:flex-row w-full max-w-5xl bg-white rounded-xl overflow-hidden shadow-lg'>
                    {/* Left: Register Form */}
                    <div className='w-full md:w-1/2 p-8 sm:p-10'>
                        <h2 className='text-2xl font-bold text-gray-800 mb-6'>
                            Register Now
                        </h2>

                        <form onSubmit={handleSubmit(onSubmit)}>
                            {/* Name */}
                            <FormInput
                                label='Name'
                                placeholder='Enter Name'
                                type='text'
                                register={register}
                                errors={errors}
                                name='name'
                                icon={<FontAwesomeIcon icon={faUser} />}
                            />

                            {/* Email */}
                            <FormInput
                                label='Email'
                                placeholder='Enter Email'
                                type='text'
                                register={register}
                                errors={errors}
                                name='email'
                                icon={<FontAwesomeIcon icon={faEnvelope} />}
                            />

                            {/* Password */}
                            <FormInput
                                label='Password'
                                placeholder='Enter Password'
                                type='password'
                                register={register}
                                errors={errors}
                                name='password'
                            />

                            {/* Register Button */}
                            <Button className={"w-full"} type='submit'>
                                Sign Up
                            </Button>
                        </form>

                        {/* Login Redirect */}
                        <p className='text-sm text-center mt-6 text-gray-600'>
                            Already have an account?{" "}
                            <Link
                                to='/login'
                                className='text-blue-600 font-medium'
                            >
                                Login Here
                            </Link>
                        </p>
                    </div>

                    {/* Banner Section */}
                    <div
                        className='hidden md:flex md:w-1/2 bg-cover bg-center text-white p-10 flex-col justify-center rounded-l-xl'
                        style={{
                            backgroundImage: `url(${sideImage})`,
                        }}
                    >
                        <h2 className='text-3xl font-bold mb-4'>
                            Join Us Today
                        </h2>
                        <p className='text-sm mb-4'>
                            Create your free account and unlock access to
                            powerful tools, personalized features, and exclusive
                            content.
                        </p>
                        <p className='text-sm'>
                            Sign up now and take the first step toward your next
                            big opportunity.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Signup;

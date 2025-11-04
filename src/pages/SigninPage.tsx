import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import type { FormikHelpers } from 'formik';
import * as Yup from 'yup';
import app from '../utils/api';
import { ToastContainer, toast } from 'react-toastify';
import { useAuth } from '@/utils/useAuth';
import 'react-toastify/dist/ReactToastify.css';

// import logo from '../../assets/logo.png'

interface LoginFormValues {
    username: string;
    password: string;
    'remember-me': boolean;
}

const SigninPage: React.FC = () => {
    const { isAuthenticated, loading } = useAuth();
    const navigate = useNavigate();
    const notify = (msg: string) => toast(msg);

    const validationSchema = Yup.object({
        username: Yup.string().required("Username is required"),
        password: Yup.string().required("Password is required"),
    });

    if(isAuthenticated){
        window.location.href = "/property-listings";
    }

    const handleLogin = async (
        values: LoginFormValues,
        { setSubmitting, resetForm }: FormikHelpers<LoginFormValues>
    ) => {
        console.log(import.meta.env.VITE_BASE_URl);
        try {
            const response = await app.post('/admin/login', values);
            const { token, user } = response.data;

            localStorage.setItem('isAuth', 'true');
            localStorage.setItem('homestyle_admin_token', token);
            localStorage.setItem('homestyle_admin_user', JSON.stringify(user));

            navigate("/property-listings");
        } catch (error) {
            console.error(error);

            notify("Invalid credentials, please try again");

            resetForm();
            setSubmitting(false);
        }
    };

    return (
        <div className="font-sans">
            <ToastContainer />
            <div className=" relative min-h-screen flex flex-col items-center justify-center py-6 px-4 bg-white">
                <img
                    src="https://scontent.facc1-1.fna.fbcdn.net/v/t39.30808-6/461231116_1085274206932538_178331596456226535_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeEWjfZ6ccG8cd-WHxlE3Pb3ns20XtXbFOmezbRe1dsU6WdDfbl048Ny6XDnTp-BawcWrLjyii2VT26D5G8aXURA&_nc_ohc=r5dUzLsZypMQ7kNvgGlCT1T&_nc_zt=23&_nc_ht=scontent.facc1-1.fna&_nc_gid=A-Z53RFStPn1PwMj_2hDcAV&oh=00_AYCQOqOOZerQuF2cBAwAxHsBWkNHe4V4-fyl8yHyepjmnQ&oe=67A7802F"
                    alt="logo"
                    className="mb-4 w-[150px] h-[100px] absolute left-5 top-0"
                />

                <div className="grid md:grid-cols-2 items-center gap-10 max-w-6xl max-md:max-w-md w-full">
                    <div className="">
                        <h2 className="lg:text-5xl text-3xl font-extrabold lg:leading-[55px] text-gray-800">
                            Seamless Login for Exclusive Access
                        </h2>
                        <p className="text-sm mt-6 text-gray-800">
                            We are a unique property agents and our aim is to ensure that our clients are left satisfied
                        </p>
                        <p className="text-sm mt-12 text-gray-800">
                            Don't have an account{' '}
                            <a href="#" className="text-[#a97e2b] font-semibold hover:underline ml-1">
                                Register here
                            </a>
                        </p>
                    </div>

                    <Formik
                        initialValues={{ username: '', password: '', 'remember-me': false }}
                        validationSchema={validationSchema}
                        onSubmit={handleLogin}
                    >
                        {({ isSubmitting }) => (
                            <Form className="max-w-md md:ml-auto w-full">
                                <h3 className="text-gray-800 text-3xl font-extrabold mb-8">Sign in</h3>

                                <div className="space-y-4">
                                    <div>
                                        <Field
                                            name="username"
                                            type="text"
                                            autoComplete="username"
                                            required
                                            className="bg-gray-100 w-full text-sm text-gray-800 px-4 py-3.5 rounded-md outline-blue-600 focus:bg-transparent"
                                            placeholder="Username"
                                        />
                                        <ErrorMessage name="username" component="div" className="text-sm text-red-500" />
                                    </div>
                                    <div>
                                        <Field
                                            name="password"
                                            type="password"
                                            autoComplete="current-password"
                                            required
                                            className="bg-gray-100 w-full text-sm text-gray-800 px-4 py-3.5 rounded-md outline-blue-600 focus:bg-transparent"
                                            placeholder="Password"
                                        />
                                        <ErrorMessage name="password" component="div" className="text-sm text-red-500" />
                                    </div>
                                    <div className="flex flex-wrap items-center justify-between gap-4">
                                        <div className="flex items-center">
                                            <Field
                                                id="remember-me"
                                                name="remember-me"
                                                type="checkbox"
                                                className="h-4 w-4 text-[#a97e2b] focus:ring-[#a97e2b] border-gray-300 rounded"
                                            />
                                            <label htmlFor="remember-me" className="ml-3 block text-sm text-gray-800">
                                                Remember me
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="!mt-8">
                                    <button
                                        type="submit"
                                        className="w-full shadow-xl py-2.5 px-4 text-sm font-semibold rounded text-white bg-[#a97e2b] hover:bg-[#7c5e20] focus:outline-none"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Logging in...' : 'Log in'}
                                    </button>
                                </div>

                                <div className="space-x-6 flex justify-center">
                                    {/* Social login buttons */}
                                </div>
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>
        </div>
    );
};

export default SigninPage;

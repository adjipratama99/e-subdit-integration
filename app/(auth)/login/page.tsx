"use client";

import React, { useEffect, useMemo } from "react";
import { useForm } from "@tanstack/react-form";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ReCAPTCHA from "react-google-recaptcha";
import { toast } from "sonner";
import { fetchPost } from "@/lib/Fetcher";
import { signIn } from "next-auth/react";
import { useLoading } from "@/context/useLoadingContext";
import { FaExclamation } from "react-icons/fa";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setCaptchaPassed, toggleShowPassword, incrementFailedAttempts, resetFailedAttempts, setToken } from "@/redux/slices/authSlice";

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY as string;

const Login = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { setLoading } = useLoading();

  const dispatch = useAppDispatch();
  const { showPassword, failedAttempts, token, captchaPassed } =
    useAppSelector((state) => state.auth);

  const redirectUrl = useMemo(
    () => searchParams.get("callbackUrl"),
    [searchParams]
  );

  useEffect(() => {
    const saved = localStorage.getItem("captchaPassed");
    dispatch(setCaptchaPassed(saved === "true"));
  }, []);

  useEffect(() => {
    localStorage.removeItem("captchaPassed");
  }, []);

  const form = useForm({
    defaultValues: {
      username: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      setLoading(true);

      const tryLogin = async () => {
        const response = await signIn("signin", {
          ...value,
          redirect: false,
        });

        if (response?.error) {
          dispatch(incrementFailedAttempts())
          setLoading(false);
          toast(
            response.error === "CredentialsSignin"
              ? "Username atau password salah"
              : response.error,
            {
              position: "top-center",
              icon: <FaExclamation color="red" />,
            }
          );
        }

        if (response?.status === 200 && !response?.error) {
          setLoading(false);
          localStorage.removeItem("captchaPassed");
          dispatch(resetFailedAttempts())
          toast.success("Successfully login!", {
            position: "top-center",
          });
          router.push(redirectUrl || "/personel");
        }
      };

      if (failedAttempts >= 3 && !captchaPassed) {
        const validate = await fetchPost({
          url: "/api/validate-captcha",
          body: { token },
        });

        if (validate.success) {
          localStorage.setItem("captchaPassed", "true");
          dispatch(setCaptchaPassed(true));
          await tryLogin();
        } else {
          setLoading(false);
          toast.error("CAPTCHA tidak valid!", {
            position: "top-center",
          });
        }
      } else {
        await tryLogin();
      }
    },
  });

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Left visual area */}
      <motion.div
        className="hidden md:flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="text-center p-8">
          <motion.h1
            className="text-4xl font-bold mb-4"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Selamat Datang kembali
          </motion.h1>
          <motion.p
            className="text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Masukkan username dan password-mu untuk login.
          </motion.p>
        </div>
      </motion.div>

      {/* Right form area */}
      <motion.div
        className="flex items-center justify-center p-6"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="w-full max-w-md bg-white p-8 rounded-lg shadow-md"
        >
          <h2 className="text-2xl font-bold mb-6 text-center">
            {process.env.NEXT_PUBLIC_APP_NAME}
          </h2>

          <form.Field
            name="username"
            validators={{
              onChange: ({ value }) =>
                !value ? "Username wajib diisi" : undefined,
            }}
          >
            {(field) => (
              <div className="mb-4">
                <label className="block mb-1 font-medium">Username</label>
                <Input
                  type="text"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full border rounded px-4 py-2"
                  required
                />
                {field.state.meta.errors?.[0] && (
                  <p className="text-sm text-red-500 mt-1">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field
            name="password"
            validators={{
              onChange: ({ value }) =>
                !value ? "Password wajib diisi" : undefined,
            }}
          >
            {(field) => (
              <div className="mb-6 relative">
                <label className="block mb-1 font-medium">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="w-full border rounded px-4 py-2 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => dispatch(toggleShowPassword())}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {field.state.meta.errors?.[0] && (
                  <p className="text-sm text-red-500 mt-1">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          {failedAttempts >= 3 && !captchaPassed && (
            <div className="mb-6">
              <ReCAPTCHA
                sitekey={RECAPTCHA_SITE_KEY}
                onChange={(token) => setToken(token || "")}
              />
            </div>
          )}

          <Button
            type="submit"
            className="w-full font-semibold py-2 rounded shadow"
          >
            Login
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;

'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
// import { Router } from "next/router";
import React, { useEffect, useState } from 'react';
import { signIn } from 'next-auth/react';
import { Button } from '../../../components/Button/Button';
// import { Button } from '@/components/ui/button/Button';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  // * if callbackURL falsy (null, undefined, false, 0, empty string) => fallbacks to the "/pages/dashboard"
  // * to pass the ts type check
  // * get("callbackUrl" || "/pages/dashboard") -> wrong logic
  const callbackUrl = searchParams.get('callbackUrl') || '/pages/homepage';
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await signIn('credentials', {
        email: email,
        pass: password,
        callbackUrl: callbackUrl,
        redirect: false,
      });
      if (!res?.error) {
        router.push(callbackUrl);
      } else {
        setLoading(false);
        alert('invalid email or password');
      }
      // axios
      //   .post("http://localhost:8000/v1/account/singin", {
      //     email: email,
      //     pass: password,
      //   })
      //   .then((res) => {
      //     setAccount(res.data);
      //     setStatus(res.status);
      //   });
    } catch (error: any) {
      console.log(error);
    }

    // if (status === 200) {
    //   router.push("/pages/dashboard/");
    // }
  };

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <Image className="mx-auto h-10 w-auto" src="/next.svg" alt="Your Company" width={100} height={100} />
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Sign in to your account
        </h2>
      </div>

      <form className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm" onSubmit={onSubmit}>
        <div className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
              Email address
            </label>
            <div className="mt-2">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                defaultValue={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
                required
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                Password
              </label>
              <div className="text-sm">
                <Link href="/pages/forgetpassword" className="font-semibold text-indigo-600 hover:text-indigo-500">
                  Forgot password?
                </Link>
              </div>
            </div>
            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                defaultValue={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
                required
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              // onClick={singInHandleClick}
            >
              {loading ? 'loading...' : 'Sign in'}
            </button>
          </div>
        </div>
        <p className="mt-4 text-center text-sm text-gray-500">
          <Link href="/" className="font-semibold leading-4 text-indigo-600 hover:text-indigo-500">
            Back to Home
          </Link>
          {/* <a href="#" className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">Start a 14 day free trial</a> */}
        </p>
        {/* <Button variant={"default"}>Log out</Button>
        <Button variant="outline">Button</Button> */}
      </form>
    </div>
  );
};

export default SignIn;

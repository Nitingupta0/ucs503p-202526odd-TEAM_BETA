import React from 'react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  footerText: string;
  footerLinkText: string;
  footerLinkTo: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, footerText, footerLinkText, footerLinkTo }) => {
  return (
    <div className="min-h-screen bg-brand-dark-blue flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-brand-light tracking-wider">Smart Navigator</h1>
          <p className="text-neutral-400 mt-2">Thapar Institute Campus</p>
        </div>

        <div className="bg-brand-dark p-8 rounded-2xl shadow-2xl border border-neutral-800">
          <h2 className="text-2xl font-bold text-center text-brand-light mb-6">{title}</h2>
          {children}
        </div>

        <div className="text-center mt-6">
          <p className="text-neutral-400">
            {footerText}{' '}
            <Link to={footerLinkTo} className="font-medium text-brand-teal hover:text-brand-teal/80 transition-colors">
              {footerLinkText}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;

import React from "react";

const Footer = () => (
    <footer className="w-full bg-gray-900 text-gray-200 py-6 mt-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
            <div className="mb-2 md:mb-0 text-center md:text-left order-2 md:order-1">
                <span className="font-semibold">Big M Boards</span> &copy; {new Date().getFullYear()}<br />
                <span className="text-sm">All rights reserved.</span>
            </div>
            <div className="text-center md:text-right order-1 md:order-2 mb-4 md:mb-0">
                <a
                    href="mailto:bigmboards@gmail.com"
                    className="text-blue-400 hover:underline"
                >
                    Contact
                </a>
                <div className="text-xs mt-1">
                    Calgary, Alberta, Canada
                </div>
            </div>
        </div>
    </footer>
);

export default Footer;

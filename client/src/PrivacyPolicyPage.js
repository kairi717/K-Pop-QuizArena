import React from 'react';
import { Helmet } from 'react-helmet-async';
import './PrivacyPolicyPage.css';

function PrivacyPolicyPage() {
    return (
        <>
            <Helmet>
                <title>Privacy Policy | K-Pop Quiz Arena</title>
                <meta name="description" content="Read the Privacy Policy for K-Pop Quiz Arena. Learn how we collect, use, and protect your data." />
            </Helmet>
            <div className="policy-container">
                <h1>Privacy Policy for K-Pop Quiz Arena</h1>
                <p><strong>Last Updated:</strong> September 8, 2025</p>

                <p>Welcome to K-Pop Quiz Arena. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our web application.</p>

                <h2>1. Information We Collect</h2>
                <p>We may collect information about you in a variety of ways. The information we may collect on the Site includes:</p>
                <ul>
                    <li><strong>Personal Data:</strong> When you register using your Google Account, we collect personal information, such as your name, email address, and profile picture, as provided by Google.</li>
                    <li><strong>Usage Data:</strong> We automatically collect information when you access and use the app, such as your IP address, browser type, pages viewed, and the dates/times of your visits.</li>
                    <li><strong>User-Generated Data:</strong> We collect data that you provide to us, such as quiz scores and world cup results, to provide our ranking services.</li>
                </ul>

                <h2>2. How We Use Your Information</h2>
                <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:</p>
                <ul>
                    <li>Create and manage your account.</li>
                    <li>Display your nickname and profile picture in leaderboards and rankings.</li>
                    <li>Email you regarding your account or order.</li>
                    <li>Monitor and analyze usage and trends to improve your experience with the Site.</li>
                    <li>Administer promotions, and rewards.</li>
                </ul>

                <h2>3. Disclosure of Your Information</h2>
                <p>We do not share your personal information with third parties except as described in this Privacy Policy. We may share information we have collected about you in certain situations, such as:</p>
                <ul>
                    <li><strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others.</li>
                    <li><strong>Third-Party Service Providers:</strong> We may share your information with third parties that perform services for us or on our behalf, including data analysis, hosting services, and advertising. (e.g., Google AdSense).</li>
                </ul>

                <h2>4. Security of Your Information</h2>
                <p>We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable.</p>

                <h2>5. Contact Us</h2>
                <p>If you have questions or comments about this Privacy Policy, please contact us at: [ms1324@gmail.com]</p>
            </div>
        </>
    );
}

export default PrivacyPolicyPage;
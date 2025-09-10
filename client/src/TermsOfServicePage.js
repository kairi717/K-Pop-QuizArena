import React from 'react';
import { Helmet } from 'react-helmet-async';
// PrivacyPolicyPage.css와 동일한 스타일을 사용하므로, CSS를 재활용합니다.
import './PrivacyPolicyPage.css';

function TermsOfServicePage() {
    return (
        <>
            <Helmet>
                <title>Terms of Service | K-Pop Quiz Arena</title>
                <meta name="description" content="Read the Terms of Service for K-Pop Quiz Arena. Learn about the rules and guidelines for using our service." />
            </Helmet>
            <div className="policy-container">
                <h1>Terms of Service for K-Pop Quiz Arena</h1>
                <p><strong>Last Updated:</strong> September 8, 2025</p>

                <h2>1. Acceptance of Terms</h2>
                <p>By accessing and using K-Pop Quiz Arena (the "Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by these terms, please do not use this Service.</p>

                <h2>2. Service Description</h2>
                <p>K-Pop Quiz Arena provides users with K-Pop related quizzes and world cup content. Users can earn points by engaging with content and viewing advertisements. These points are part of a reward system, the specifics of which can be changed at any time at our discretion.</p>

                <h2>3. User Accounts</h2>
                <p>To access most features of the Service, you must register for an account via Google Login. You are responsible for safeguarding your account and for any activities or actions under your account. You agree not to disclose your password to any third party.</p>

                <h2>4. User Conduct</h2>
                <p>You agree not to use the Service to:</p>
                <ul>
                    <li>Engage in any activity that is unlawful, harmful, or fraudulent.</li>
                    <li>Attempt to cheat or manipulate the point or ranking system.</li>
                    <li>Impersonate any person or entity.</li>
                    <li>Disrupt or interfere with the security of, or otherwise abuse, the Service.</li>
                </ul>
                <p>We reserve the right to terminate accounts that violate these rules.</p>

                <h2>5. Intellectual Property</h2>
                <p>The Service and its original content (excluding user-generated content and third-party images), features, and functionality are and will remain the exclusive property of K-Pop Quiz Arena. All third-party images (e.g., artist photos) are the property of their respective copyright holders.</p>

                <h2>6. Termination</h2>
                <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
                
                <h2>7. Limitation of Liability</h2>
                <p>In no event shall K-Pop Quiz Arena, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>

                <h2>8. Changes to Terms</h2>
                <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of any changes by posting the new Terms of Service on this page.</p>

                <h2>9. Contact Us</h2>
                <p>If you have any questions about these Terms, please contact us at: [ms1324@gmail.com]</p>
            </div>
        </>
    );
}

export default TermsOfServicePage;
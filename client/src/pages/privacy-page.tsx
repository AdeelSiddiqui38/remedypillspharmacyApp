import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link to="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Privacy Policy</CardTitle>
            <CardDescription>Last updated: {new Date().toLocaleDateString()}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
              <p className="text-gray-700 leading-relaxed">
                RemedyPills Pharmacy ("we", "us", "our", or "Company") operates this patient portal application.
                As a licensed pharmacy in Alberta, Canada, we are a custodian of health information under
                Alberta's <strong>Health Information Act (HIA)</strong>, and our handling of personal information
                more generally is also governed by the federal <strong>Personal Information Protection and
                Electronic Documents Act (PIPEDA)</strong>. This page informs you of our policies regarding the
                collection, use, disclosure, retention, and destruction of your information.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Information Collection and Use</h2>
              <p className="text-gray-700 mb-3">We collect several different types of information for various purposes:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li><strong>Personal Data:</strong> Name, email address, phone number, date of birth</li>
                <li><strong>Health Information:</strong> Prescription details, appointment history, and health logs, which are treated as "health information" under the HIA</li>
                <li><strong>Usage Data:</strong> Browser type, IP address, pages visited, time and date of visits</li>
                <li><strong>Social Login Data:</strong> If you use Google login, we collect profile information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. Use of Data</h2>
              <p className="text-gray-700 mb-3">RemedyPills Pharmacy uses the collected data for various purposes:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>To provide and maintain our service</li>
                <li>To manage prescriptions and appointments</li>
                <li>To send transactional communications (e.g. appointment or prescription status updates) and, with your consent, promotional communications</li>
                <li>To detect and prevent fraud or security issues</li>
                <li>To improve and optimize our application</li>
              </ul>
              <p className="text-gray-700 mt-3">
                We do not sell your personal information or health information to third parties.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Data Retention and Destruction</h2>
              <p className="text-gray-700">
                In accordance with Alberta College of Pharmacy standards, we retain patient pharmacy records for
                <strong> 10 years from the date of your last pharmacy service</strong> (or, if you were a minor at
                the time of that service, until 2 years past the age of majority). After this retention period
                expires, your records are automatically and permanently deleted from our systems — we do not keep
                health records longer than required. Non-health account information may be retained for a shorter
                period and is deleted on request as described below.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Data Deletion Requests</h2>
              <p className="text-gray-700 mb-3">
                You have the right to request deletion of your personal data, subject to our legal obligation
                to retain pharmacy records for the period described above. You can:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Request deletion directly within the application settings</li>
                <li>Contact our Privacy Officer (below) with your deletion request</li>
                <li>If you used Google login, you can also request deletion through your Google account</li>
              </ul>
              <p className="text-gray-700 mt-3">
                Where we are not legally required to retain a record, we will remove it within 30 days of your request.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Third-Party Services and Data Location</h2>
              <p className="text-gray-700">
                Our application uses the following third-party services:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mt-3">
                <li><strong>Google Login:</strong> For authentication purposes</li>
                <li><strong>Twilio:</strong> For SMS notifications</li>
                <li><strong>Email services:</strong> For appointment and account communications</li>
              </ul>
              <p className="text-gray-700 mt-3">
                These third parties have their own privacy policies governing the use of information they collect
                from you. Where your health information is concerned, we take steps to send only the minimum
                information necessary in SMS and email messages — full prescription, appointment, and health
                details are only ever shown after you log in to the secure patient portal. Our pharmacy records
                are stored within Canada, consistent with Alberta College of Pharmacy requirements.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Security of Data</h2>
              <p className="text-gray-700">
                The security of your data is important to us, but remember that no method of transmission over
                the Internet is 100% secure. We use encrypted connections (HTTPS), password hashing, and access
                controls limiting health information access to authorized staff, and follow industry best
                practices to protect your information.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Breach Notification</h2>
              <p className="text-gray-700">
                If we become aware of a privacy breach involving your health information that creates a real risk
                of significant harm, we will notify you and the Office of the Information and Privacy Commissioner
                of Alberta, as required under the Health Information Act.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. Contact Us / Privacy Officer</h2>
              <p className="text-gray-700">
                Questions, concerns, or requests about this Privacy Policy or your personal/health information
                should be directed to our designated Privacy Officer:
              </p>
              <div className="mt-3 p-4 bg-gray-50 rounded">
                <p className="text-gray-700"><strong>Privacy Officer:</strong> Nayel Anwer, Pharmacy Manager</p>
                <p className="text-gray-700"><strong>Email:</strong> remedypillspharmacy@gmail.com</p>
                <p className="text-gray-700"><strong>Phone:</strong> +1 403 980 7003</p>
                <p className="text-gray-700"><strong>Fax:</strong> +1 403 518 7522</p>
                <p className="text-gray-700"><strong>Address:</strong> Unit # 135, 246 Nolanridge Crescent NW, Calgary, AB T3R 1W9</p>
              </div>
              <p className="text-gray-700 mt-3">
                If you are not satisfied with our response, you may contact the Office of the Information and
                Privacy Commissioner of Alberta.
              </p>
            </section>

            <section className="bg-blue-50 p-4 rounded-lg">
              <h2 className="text-sm font-semibold text-blue-900 mb-2">Data Deletion Confirmation</h2>
              <p className="text-sm text-blue-800">
                If you have submitted a data deletion request, we will send you a confirmation email once
                your data has been completely removed from our systems.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

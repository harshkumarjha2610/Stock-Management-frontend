'use client';
import React from 'react';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white flex flex-col items-center py-20 px-4 sm:px-8">
      <div className="max-w-4xl w-full">
        <h1 className="text-3xl md:text-5xl font-bold mb-4 text-[#ef6b23]">TERMS OF USE (SIMULATOR PLATFORM)</h1>
        {/* <p className="text-gray-400 mb-8">Last Updated: [Insert Date]</p> */}

        <div className="space-y-8 text-gray-300 bg-[#2a2a2a] p-6 md:p-10 rounded-[20px] border border-white/10 shadow-lg leading-relaxed text-sm md:text-base">

          <section className="space-y-4">
            <p>These Terms of Use (“Terms”) govern your access to and use of the CoBuild Simulator platform (“Platform”), operated by CoBuild Capital (“Company”, “we”, “us”, or “our”).</p>
            <p>By accessing or using the Platform, you (“User”, “you”, or “your”) agree to be legally bound by these Terms. If you do not agree, you must not use the Platform.</p>
            <p>These Terms are an electronic record under the provisions of the Information Technology Act, 2000 and do not require physical or digital signatures.</p>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-white mb-4">1. Nature of the Platform</h2>
            <ul className="space-y-3 list-none">
              <li><span className="font-semibold text-white">1.1</span> The Platform is a simulation-based, educational, and demonstration-only environment designed to help Users understand how a real estate investment interface may function.</li>
              <li><span className="font-semibold text-white">1.2</span> The Platform does not provide:
                <ul className="list-disc ml-6 md:ml-8 mt-2 space-y-1">
                  <li>real investment opportunities</li>
                  <li>financial products or securities</li>
                  <li>brokerage or advisory services</li>
                  <li>real-world transactions or asset ownership</li>
                </ul>
              </li>
              <li><span className="font-semibold text-white">1.3</span> All features, including dashboards, projects, assets, tokens, metrics, or returns, are purely illustrative and fictional.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-white mb-4">2. Simulator Functionality</h2>
            <ul className="space-y-3 list-none">
              <li><span className="font-semibold text-white">2.1</span> The Platform allows Users to interact with simulated real estate scenarios, including:
                <ul className="list-disc ml-6 md:ml-8 mt-2 space-y-1">
                  <li>viewing hypothetical projects</li>
                  <li>allocating virtual funds</li>
                  <li>tracking simulated performance</li>
                  <li>experiencing interface flows</li>
                </ul>
              </li>
              <li><span className="font-semibold text-white">2.2</span> Any references to:
                <ul className="list-disc ml-6 md:ml-8 mt-2 space-y-1">
                  <li>“investment”</li>
                  <li>“returns”</li>
                  <li>“tokens” or “SQFT”</li>
                  <li>“portfolio value”</li>
                </ul>
                are virtual representations only and carry no real-world value or legal standing.
              </li>
              <li><span className="font-semibold text-white">2.3</span> The Platform does not execute:
                <ul className="list-disc ml-6 md:ml-8 mt-2 space-y-1">
                  <li>payments or fund transfers</li>
                  <li>blockchain transactions or smart contracts</li>
                  <li>ownership or equity allocation</li>
                </ul>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-white mb-4">3. No Financial Product or Offer</h2>
            <ul className="space-y-3 list-none">
              <li><span className="font-semibold text-white">3.1</span> The Platform does not constitute:
                <ul className="list-disc ml-6 md:ml-8 mt-2 space-y-1">
                  <li>an offer to sell securities</li>
                  <li>an invitation to invest</li>
                  <li>a solicitation of funds</li>
                  <li>a financial product under applicable Indian laws</li>
                </ul>
              </li>
              <li><span className="font-semibold text-white">3.2</span> Nothing on the Platform should be interpreted as investment, legal, tax, or financial advice.</li>
              <li><span className="font-semibold text-white">3.3</span> Any future live platform (if launched) will be subject to separate agreements, regulatory approvals, and legally binding documentation.</li>
              <li><span className="font-semibold text-white">3.4</span> Simulator performance not linked to future investment decisions.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-white mb-4">4. No Real Money, Earnings, or Returns</h2>
            <ul className="space-y-3 list-none">
              <li><span className="font-semibold text-white">4.1</span> The Simulator does not involve real money.</li>
              <li><span className="font-semibold text-white">4.2</span> All displayed returns, profits, or financial outcomes are:
                <ul className="list-disc ml-6 md:ml-8 mt-2 space-y-1">
                  <li>hypothetical</li>
                  <li>non-transferable</li>
                  <li>non-withdrawable</li>
                  <li>non-redeemable</li>
                </ul>
              </li>
              <li><span className="font-semibold text-white">4.3</span> Users cannot derive any financial gain or loss from using the Platform.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-white mb-4">5. Eligibility</h2>
            <ul className="space-y-3 list-none">
              <li><span className="font-semibold text-white">5.1</span> You must be legally capable of entering into a binding contract under applicable law, including the Indian Contract Act, 1872.</li>
              <li><span className="font-semibold text-white">5.2</span> By using the Platform, you represent that:
                <ul className="list-disc ml-6 md:ml-8 mt-2 space-y-1">
                  <li>the information you provide is accurate</li>
                  <li>you are not restricted by any law from using such services</li>
                </ul>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-white mb-4">6. User Registration and Account</h2>
            <ul className="space-y-3 list-none">
              <li><span className="font-semibold text-white">6.1</span> Certain features may require account creation.</li>
              <li><span className="font-semibold text-white">6.2</span> You agree to provide accurate and complete information, including:
                <ul className="list-disc ml-6 md:ml-8 mt-2 space-y-1">
                  <li>name</li>
                  <li>contact details</li>
                  <li>any optional profile data</li>
                </ul>
              </li>
              <li><span className="font-semibold text-white">6.3</span> You are responsible for maintaining the confidentiality of your account credentials.</li>
              <li><span className="font-semibold text-white">6.4</span> <span className="font-semibold text-white">Age Requirement and User Responsibility:</span> By accessing and using this platform, you represent and warrant that you are at least 18 years of age. Users are solely responsible for declaring their correct age. Accurate age declaration is a requirement for the fair and compliant use of our services; any misrepresentation of age remains the liability of the user.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-white mb-4">7. User Conduct</h2>
            <p className="mb-2">You agree not to:</p>
            <ul className="list-disc ml-6 md:ml-8 space-y-1">
              <li>misuse the Platform for unlawful purposes</li>
              <li>attempt to reverse engineer or exploit the system</li>
              <li>interfere with Platform functionality</li>
              <li>misrepresent the Platform as a real investment service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-white mb-4">8. Intellectual Property</h2>
            <ul className="space-y-3 list-none">
              <li><span className="font-semibold text-white">8.1</span> All content on the Platform—including interface design, graphics, simulations, text, and software—is owned by the Company and protected under applicable intellectual property laws.</li>
              <li><span className="font-semibold text-white">8.2</span> You may not copy, reproduce, distribute, or commercially exploit any part of the Platform without prior written consent.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-white mb-4">9. Disclaimers</h2>
            <ul className="space-y-3 list-none">
              <li><span className="font-semibold text-white">9.1</span> The Platform is provided on an “as is” and “as available” basis.</li>
              <li><span className="font-semibold text-white">9.2</span> The Company makes no warranties regarding:
                <ul className="list-disc ml-6 md:ml-8 mt-2 space-y-1">
                  <li>accuracy of simulated data</li>
                  <li>reliability of projections</li>
                  <li>resemblance to real-world markets</li>
                  <li>Any 3rd party link accuracy</li>
                </ul>
              </li>
              <li><span className="font-semibold text-white">9.3</span> Simulation outcomes may be:
                <ul className="list-disc ml-6 md:ml-8 mt-2 space-y-1">
                  <li>simplified</li>
                  <li>exaggerated</li>
                  <li>non-representative of actual conditions</li>
                </ul>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-white mb-4">10. Limitation of Liability</h2>
            <ul className="space-y-3 list-none">
              <li><span className="font-semibold text-white">10.1</span> To the maximum extent permitted by law, the Company shall not be liable for:
                <ul className="list-disc ml-6 md:ml-8 mt-2 space-y-1">
                  <li>any direct or indirect damages</li>
                  <li>reliance on simulated data</li>
                  <li>decisions made outside the Platform based on Platform experience</li>
                </ul>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-white mb-4">11. Indemnification</h2>
            <p className="mb-2">You agree to indemnify and hold harmless the Company and its affiliates against any claims, damages, or losses arising from:</p>
            <ul className="list-disc ml-6 md:ml-8 space-y-1">
              <li>misuse of the Platform</li>
              <li>violation of these Terms</li>
              <li>breach of applicable laws</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-white mb-4">12. Suspension and Termination</h2>
            <ul className="space-y-3 list-none">
              <li><span className="font-semibold text-white">12.1</span> The Company may suspend or terminate your access at any time for:
                <ul className="list-disc ml-6 md:ml-8 mt-2 space-y-1">
                  <li>violation of these Terms</li>
                  <li>security concerns</li>
                  <li>operational reasons</li>
                </ul>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-white mb-4">13. Modifications</h2>
            <ul className="space-y-3 list-none">
              <li><span className="font-semibold text-white">13.1</span> The Company reserves the right to modify these Terms at any time.</li>
              <li><span className="font-semibold text-white">13.2</span> Continued use of the Platform constitutes acceptance of updated Terms.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-white mb-4">14. Governing Law and Jurisdiction</h2>
            <p className="mb-2">These Terms shall be governed by the laws of India.</p>
            <p>All disputes shall fall under the jurisdiction of the courts in Mumbai, Maharashtra.</p>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-white mb-4">15. Communications</h2>
            <p className="mb-2">You agree to receive communications via:</p>
            <ul className="list-disc ml-6 md:ml-8 mb-4 space-y-1">
              <li>email</li>
              <li>SMS</li>
              <li>phone calls</li>
              <li>messaging platforms</li>
            </ul>
            <p>You may opt out of non-essential communications at any time.</p>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-white mb-4">16. Grievance Redressal</h2>
            <p>For complaints or concerns, contact:</p>
            <p className="text-[#ef6b23] mt-2 font-medium">compliance@cobuild.capital</p>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-white mb-4">17. General Provisions</h2>
            <ul className="space-y-3 list-none">
              <li><span className="font-semibold text-white">17.1</span> Nothing in these Terms creates:
                <ul className="list-disc ml-6 md:ml-8 mt-2 space-y-1">
                  <li>partnership</li>
                  <li>agency</li>
                  <li>joint venture</li>
                  <li>employment relationship</li>
                </ul>
                between you and the Company.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-white mb-4">18. Acknowledgement</h2>
            <p className="mb-2">By using the Platform, you confirm that:</p>
            <ul className="list-disc ml-6 md:ml-8 mb-4 space-y-1">
              <li>you understand the Platform is a simulation only</li>
              <li>no real investment activity occurs</li>
              <li>no financial rights or obligations are created</li>
            </ul>
          </section>

          <div className="pt-8 mt-8 border-t border-white/10">
            <p className="text-lg md:text-xl font-medium text-white">
              For Any Support, reach out to us at: <a href="mailto:support@cobuild.capital" className="text-[#ef6b23] hover:underline">support@cobuild.capital</a>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

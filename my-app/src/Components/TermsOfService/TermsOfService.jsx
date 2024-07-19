import React from 'react';
import styled from 'styled-components';
import Navbar from '../Navbar/Navbar'; // Ensure you have the Navbar component available

const FullScreenContainer = styled.div`
  background-color: #0d0d0d;
  color: white;
  font-family: Arial, sans-serif;
  height: 100vh;
  width: 100vw;
  overflow-y: auto;
`;

const ContentContainer = styled.div`
  padding: 40px;
  max-width: 800px;
  margin: 0 auto;
  border-radius: 10px;

  &::-webkit-scrollbar {
    width: 12px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(40, 40, 40, 0.9);
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.4);
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.6);
  }
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 20px;
  color: white;
`;

const SectionTitle = styled.h2`
  margin-top: 20px;
  color: white;
`;

const SubSectionTitle = styled.h3`
  margin-top: 15px;
  color: white;
`;

const Paragraph = styled.p`
  margin-bottom: 15px;
  line-height: 1.6;
  color: white;
`;

const List = styled.ul`
  list-style-type: disc;
  padding-left: 20px;
  margin-bottom: 15px;
  color: white;
`;

const ListItem = styled.li`
  margin-bottom: 10px;
  color: white;
`;

const SubSection = styled.div`
  margin-top: 20px;
  padding-left: 20px;
`;

const TermsOfService = () => {
  return (
    <FullScreenContainer>
      {/* <div className='homenavbar'>
        <Navbar />
      </div> */}
      <ContentContainer>
        <Title>Terms of Service</Title>
        <Paragraph>
          Welcome to the website located at <a href="https://virtuartai.com/" style={{ color: '#1e90ff' }}>https://virtuartai.com/</a> (the “Website”), operated by VirtuartAI, s.r.o. (“VirtuartAI,” “we,” “our,” or “us”). These Terms of Service (“Terms”) govern your access to and use of the Website and all associated web pages, websites, and social media pages, and any online services (collectively, our “Services”) provided by VirtuartAI. By using our Services, you agree to these Terms. Please read them carefully.
        </Paragraph>
        
        <SectionTitle>Agreement to Terms</SectionTitle>
        <Paragraph>
          By accessing and using our Services, you agree to be bound by these Terms and our Privacy Policy, which is incorporated by reference into these Terms. If you do not agree with these Terms, you must not use our Services.
        </Paragraph>
        
        <SectionTitle>Changes to Terms</SectionTitle>
        <Paragraph>
          We reserve the right to change these Terms at any time. Any changes will be effective immediately upon posting on the Website. Your continued use of our Services after the posting of revised Terms means that you accept and agree to the changes.
        </Paragraph>
        
        <SectionTitle>Use of Services</SectionTitle>
        <SubSectionTitle>Eligibility</SubSectionTitle>
        <Paragraph>
          You must be at least 18 years old to use our Services. By using our Services, you represent and warrant that you meet this requirement.
        </Paragraph>
        
        <SubSectionTitle>User Account</SubSectionTitle>
        <Paragraph>
          To access certain features of our Services, you may need to create an account. You agree to provide accurate, current, and complete information during the registration process and to update such information as necessary. You are responsible for safeguarding your account information and for any activities or actions under your account.
        </Paragraph>
        
        <SubSectionTitle>Usage Policy</SubSectionTitle>
        <SubSectionTitle>Acceptable Use</SubSectionTitle>
        <Paragraph>
          You agree to use our Services only for lawful purposes and in accordance with these Terms. You agree not to:
        </Paragraph>
        <List>
          <ListItem>Use our Services in any way that violates any applicable federal, state, local, or international law or regulation.</ListItem>
          <ListItem>Exploit, harm, or attempt to exploit or harm minors in any way by exposing them to inappropriate content or otherwise.</ListItem>
          <ListItem>Transmit, or procure the sending of, any advertising or promotional material, including any "junk mail," "chain letter," "spam," or any other similar solicitation.</ListItem>
          <ListItem>Impersonate or attempt to impersonate VirtuartAI, a VirtuartAI employee, another user, or any other person or entity.</ListItem>
          <ListItem>Engage in any other conduct that restricts or inhibits anyone’s use or enjoyment of the Services, or which, as determined by us, may harm VirtuartAI or users of the Services or expose them to liability.</ListItem>
        </List>
        
        <SubSectionTitle>Prohibited Use</SubSectionTitle>
        <Paragraph>
          You agree not to use our Services:
        </Paragraph>
        <List>
          <ListItem>In any way that could disable, overburden, damage, or impair the site or interfere with any other party's use of the Services, including their ability to engage in real-time activities through the Services.</ListItem>
          <ListItem>To use any robot, spider, or other automatic device, process, or means to access the Services for any purpose, including monitoring or copying any of the material on the Services.</ListItem>
          <ListItem>To introduce any viruses, Trojan horses, worms, logic bombs, or other material that is malicious or technologically harmful.</ListItem>
          <ListItem>To attempt to gain unauthorized access to, interfere with, damage, or disrupt any parts of the Services, the server on which the Services are stored, or any server, computer, or database connected to the Services.</ListItem>
          <ListItem>To attack the Services via a denial-of-service attack or a distributed denial-of-service attack.</ListItem>
        </List>
        
        <SectionTitle>Intellectual Property</SectionTitle>
        <SubSection>
          <SubSectionTitle>Ownership</SubSectionTitle>
          <Paragraph>
            All content and materials available through our Services, including but not limited to text, graphics, logos, icons, images, audio clips, video clips, and software, are the property of VirtuartAI or its licensors and are protected by intellectual property laws.
          </Paragraph>
          
          <SubSectionTitle>License</SubSectionTitle>
          <Paragraph>
            We offer different subscription plans, including a free plan and various paid plans, each with its own usage rights:
          </Paragraph>
          
          <SubSection>
            <SubSectionTitle>Free Plan</SubSectionTitle>
            <List>
              <ListItem>
                <strong>Limited License:</strong> Users of the free plan are granted a limited, non-exclusive, non-transferable, and revocable license to access and use our Services for personal, non-commercial purposes only.
              </ListItem>
              <ListItem>
                <strong>Restrictions:</strong> Images generated under the free plan cannot be used for commercial purposes. This includes, but is not limited to, selling, redistributing, or using the images in any commercial product or service.
              </ListItem>
            </List>
            
            <SubSectionTitle>Paid Plans</SubSectionTitle>
            <List>
              <ListItem>
                <strong>Extended License:</strong> Users of the paid plans are granted a broader, non-exclusive, non-transferable, and revocable license to access and use our Services for any purposes, including commercial use.
              </ListItem>
              <ListItem>
                <strong>Commercial Use:</strong> Images generated under the paid plans can be used for commercial purposes. Users are allowed to sell, redistribute, and incorporate these images into commercial products or services.
              </ListItem>
            </List>
          </SubSection>
          
          <SubSectionTitle>General Restrictions</SubSectionTitle>
          <Paragraph>
            Regardless of the subscription plan, users must not:
          </Paragraph>
          <List>
            <ListItem>Reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any of the material on our Services, except as explicitly allowed under the applicable subscription plan.</ListItem>
            <ListItem>Use our Services in any way that violates any applicable federal, state, local, or international law or regulation.</ListItem>
            <ListItem>Use our Services to exploit, harm, or attempt to exploit or harm minors in any way by exposing them to inappropriate content or otherwise.</ListItem>
          </List>
          <Paragraph>
            These licenses are subject to compliance with these Terms. Any violation of these Terms may result in the termination of your license and access to our Services.
          </Paragraph>
        </SubSection>
        
        <SectionTitle>Disclaimer of Warranties and Limitation of Liability</SectionTitle>
        <SubSectionTitle>Disclaimer of Warranties</SubSectionTitle>
        <Paragraph>
          Our Services are provided on an "as is" and "as available" basis. We make no warranties, either express or implied, concerning the operation or availability of our Services or the content, materials, or products included on our Services.
        </Paragraph>
        
        <SubSectionTitle>Limitation of Liability</SubSectionTitle>
        <Paragraph>
          To the fullest extent permitted by law, VirtuartAI will not be liable for any direct, indirect, incidental, special, consequential, or punitive damages arising out of or in connection with your use of our Services.
        </Paragraph>
        
        <SectionTitle>Indemnification</SectionTitle>
        <Paragraph>
          You agree to indemnify, defend, and hold harmless VirtuartAI and its directors, officers, employees, and agents from any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees arising out of or relating to your violation of these Terms or your use of our Services.
        </Paragraph>
        
        <SectionTitle>Governing Law and Dispute Resolution</SectionTitle>
        <SubSectionTitle>Governing Law</SubSectionTitle>
        <Paragraph>
          These Terms and any disputes arising out of or relating to these Terms will be governed by and construed in accordance with the laws of the Slovak Republic, without regard to its conflict of laws rules.
        </Paragraph>
        
        <SubSectionTitle>International Users</SubSectionTitle>
        <Paragraph>
          VirtuartAI is based in Slovakia and the information we provide is governed by Slovak law. If you access our Services from outside Slovakia, you acknowledge and agree that your information may be transferred to, stored, and processed in Slovakia, where our servers are located and our central database is operated. By using our Services, you consent to the transfer of your information to our facilities and those third parties with whom we share it, as described in our Privacy Policy.
        </Paragraph>
        
        <SubSectionTitle>GDPR</SubSectionTitle>
        <SubSectionTitle>Data Collection and Processing</SubSectionTitle>
        <Paragraph>
          In accordance with the Regulation (EU) 2016/679 of the European Parliament and of the Council (General Data Protection Regulation or GDPR), we collect, process, and store personal data of our users only to the extent necessary for providing and improving our Services. Your personal data will be processed lawfully, fairly, and transparently, and collected for specified, explicit, and legitimate purposes.
        </Paragraph>
        
        <SubSectionTitle>Data Subject Rights</SubSectionTitle>
        <Paragraph>
          As a data subject, you have the following rights regarding your personal data:
        </Paragraph>
        <List>
          <ListItem>The right to access your personal data.</ListItem>
          <ListItem>The right to rectification of your personal data if it is inaccurate or incomplete.</ListItem>
          <ListItem>The right to erasure of your personal data ("the right to be forgotten").</ListItem>
          <ListItem>The right to restrict the processing of your personal data.</ListItem>
          <ListItem>The right to data portability.</ListItem>
          <ListItem>The right to object to the processing of your personal data.</ListItem>
          <ListItem>The right to withdraw consent to the processing of your personal data, where processing is based on consent.</ListItem>
        </List>
        
        <SubSectionTitle>Contact for Data Protection</SubSectionTitle>
        <Paragraph>
          If you have any questions or concerns regarding our Privacy Policy or wish to exercise your rights under the GDPR, you can contact us at: privacy@virtuartai.com.
        </Paragraph>
        
        <SubSectionTitle>Data Security</SubSectionTitle>
        <Paragraph>
          We have implemented appropriate technical and organizational measures to protect your personal data against unauthorized access, loss, destruction, or damage. Despite these measures, we cannot guarantee absolute security of your personal data, as no data transmission over the internet or other public network can be guaranteed to be 100% secure.
        </Paragraph>
        
        <SubSectionTitle>Data Transfers Outside the EU</SubSectionTitle>
        <Paragraph>
          Your personal data may be transferred to countries outside the European Union. In such cases, we will ensure that appropriate safeguards are in place to protect your personal data in accordance with the GDPR.
        </Paragraph>
        
        <SectionTitle>Miscellaneous</SectionTitle>
        <Paragraph>
          These Terms constitute the entire agreement between you and VirtuartAI regarding the use of our Services. If any provision of these Terms is deemed invalid or unenforceable, such provision will be limited or eliminated to the minimum extent necessary, and the remaining provisions of these Terms will remain in full force and effect.
        </Paragraph>
        
        <SectionTitle>Contact Us</SectionTitle>
        <Paragraph>
          If you have any questions about these Terms, you can contact us at: support@virtuartai.com.
        </Paragraph>
      </ContentContainer>
    </FullScreenContainer>
  );
};

export default TermsOfService;

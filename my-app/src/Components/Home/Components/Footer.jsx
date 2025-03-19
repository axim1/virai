import styles from "./Footer.module.css";
import iconsApps from '../../../assets/vector_icons/downloadapp 1.png';
import virai_log from '../../../assets/vector_icons/virai-logo.svg';

// my-app/src/assets/vector_icons/virai-logo.svg
const Footer = () => {
  return (
    <footer className={styles.footer}>
        <div className={styles.divider} />
      <div className={styles.container}>
        {/* Branding and App Links */}
        <div className={styles.branding}>
        <img src={virai_log} alt="App Store" className={styles.virai_logo} />
        <div className={styles.appLinks}>
            <img src={iconsApps} alt="App Store" className={styles.appIcon} />
            {/* <img src="/google-play.png" alt="Google Play" className={styles.appIcon} />
            <img src="/microsoft.png" alt="Microsoft Store" className={styles.appIcon} /> */}
          </div>
          <p className={styles.copyright}>© 2025 VirtuartAI</p>
        </div>

        {/* Quick Links */}
        <div className={styles.links}>
          <h3 className={styles.heading}>Quick Links</h3>
          <div className={styles.divider_sml} />

          <ul className={styles.linkList}>
            <li><a href="/" className={styles.link}>Home</a></li>
            <li><a href="/gallery" className={styles.link}>Gallery</a></li>
            <li><a href="/pricing" className={styles.link}>Pricing</a></li>
            <li><a href="/login" className={styles.link}>Log In</a></li>
          </ul>
        </div>

        {/* Terms & Conditions */}
        <div className={styles.links}>
          <h3 className={styles.heading}>Terms & Conditions</h3>
          <div className={styles.divider_sml} />

          <ul className={styles.linkList}>
            <li><a href="/terms" className={styles.link}>Terms Of Service</a></li>
            <li><a href="/refund-policy" className={styles.link}>Refund Policy</a></li>
            <li><a href="/privacy-policy" className={styles.link}>Privacy Policy</a></li>
            <li><a href="/cookie-policy" className={styles.link}>Cookie Policy</a></li>
          </ul>
        </div>

        {/* Work With Us & Blog */}
        <div className={styles.links}>
          <h3 className={styles.heading}>Work With Us</h3>
          <div className={styles.divider_sml} />

          <ul className={styles.linkList}>
            <li><a href="/affiliate" className={styles.link}>Affiliate Program</a></li>
            <li><a href="/whitelabel" className={styles.link}>Whitelabel Program</a></li>
            <li><a href="/api-access" className={styles.link}>API Access</a></li>
            <li><a href="/mls-partnership" className={styles.link}>MLS Partnership</a></li>
          </ul></div>
        <div className={styles.links}>
          <h3 className={styles.heading}>Blog</h3>
          <div className={styles.divider_sml} />

          <ul className={styles.linkList}>
            <li><a href="/blog/how-to" className={styles.link}>How To Do VirtuartAI</a></li>
            <li><a href="/blog/pricing" className={styles.link}>VirtuartAI Pricing</a></li>
            <li><a href="/blog/overview" className={styles.link}>VirtuartAI</a></li>
            <li><a href="/blog/competitors" className={styles.link}>VirtuartAI Competitors</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

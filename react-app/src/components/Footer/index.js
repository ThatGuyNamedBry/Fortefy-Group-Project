import './Footer.css'

function Footer() {

  return (
    <footer id="footer-container">

      <div className="footer-col" id="creators">
        <i className="fa-solid fa-users footer-header" aria-hidden="true"></i><span className="visually-hidden">Created by</span>

        <div className="creator">
          <span className="creator-text">Alex Basso</span>
          <div className='creator-icons'>
            <a href="https://www.linkedin.com/in/alexjbasso/"><i className="fa-brands fa-linkedin creator-link-icon" aria-hidden="true"></i><span className="visually-hidden">Alex Basso on LinkedIn</span></a>
            <a href="https://github.com/alexjbasso"><i className="fa-brands fa-github creator-link-icon" aria-hidden="true"></i><span className="visually-hidden">Alex Basso on GitHub</span></a>
          </div>
        </div>
        <div className="creator">
          <span className="creator-text">Angad Bhatia</span>
          <div className='creator-icons'>
            <a href="https://www.linkedin.com/in/angad-bhatia/"><i className="fa-brands fa-linkedin creator-link-icon" aria-hidden="true"></i><span className="visually-hidden">Angad Bhatia on LinkedIn</span></a>
            <a href="https://github.com/Angad-Bhatia"><i className="fa-brands fa-github creator-link-icon" aria-hidden="true"></i><span className="visually-hidden">Angad Bhatia on GitHub</span></a>
          </div>
        </div>
        <div className="creator">
          <span className="creator-text">Joshua Hoang</span>
          <div className='creator-icons'>
            <a href="https://www.linkedin.com/in/joshua-hoang-47979426b/"><i className="fa-brands fa-linkedin creator-link-icon" aria-hidden="true"></i><span className="visually-hidden">Joshua Hoang on LinkedIn</span></a>
            <a href="https://github.com/jhoang304"><i className="fa-brands fa-github creator-link-icon" aria-hidden="true"></i><span className="visually-hidden">Joshua Hoang on GitHub</span></a>
          </div>
        </div>
        <div className="creator">
          <span className="creator-text">Bryant Stine</span>
          <div className='creator-icons'>
            <a href="https://www.linkedin.com/in/bryant-stine-447010272/"><i className="fa-brands fa-linkedin creator-link-icon" aria-hidden="true"></i><span className="visually-hidden">Bryant Stine on LinkedIn</span></a>
            <a href="https://github.com/ThatGuyNamedBry"><i className="fa-brands fa-github creator-link-icon" aria-hidden="true"></i><span className="visually-hidden">Bryant Stine on GitHub</span></a>
          </div>
        </div>

      </div>
      <div className="footer-col" id="languages">
        <i className="fa-solid fa-code footer-header" aria-hidden="true"></i><span className="visually-hidden">Built with</span>
        <span>JavaScript</span>
        <span>React</span>
        <span>Redux</span>
        <span>Python</span>
        <span>Flask</span>
      </div>
      <div className="footer-col" id="for">
        <i className="fa-solid fa-school footer-header" aria-hidden="true"></i><span className="visually-hidden">Made for</span>
        <span>App Academy</span>
        <span>August 2023</span>
        <a href="https://github.com/ThatGuyNamedBry/Fortefy-Group-Project">v1.0</a>
      </div>
    </footer>
  )
};

export default Footer;

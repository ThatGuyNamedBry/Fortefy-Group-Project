import './Footer.css'

function Footer() {

  return (
    <div id="footer-container">

      <div className="footer-col" id="creators">
        <i className="fa-solid fa-users footer-header"></i>

        <div className="creator">
          <span className="creator-text">Alex Basso</span>
          <div className='creator-icons'>
            <a href="https://www.linkedin.com/in/alexjbasso/"><i className="fa-brands fa-linkedin creator-link-icon"></i></a>
            <a href="https://github.com/alexjbasso"><i className="fa-brands fa-github creator-link-icon"></i></a>
          </div>
        </div>
        <div className="creator">
          <span className="creator-text">Angad Bhatia</span>
          <div className='creator-icons'>
            <a href="https://www.linkedin.com/in/angad-bhatia/"><i className="fa-brands fa-linkedin creator-link-icon"></i></a>
            <a href="https://github.com/Angad-Bhatia"><i className="fa-brands fa-github creator-link-icon"></i></a>
          </div>
        </div>
        <div className="creator">
          <span className="creator-text">Joshua Hoang</span>
          <div className='creator-icons'>
            <a href="https://www.linkedin.com/in/joshua-hoang-47979426b/"><i className="fa-brands fa-linkedin creator-link-icon"></i></a>
            <a href="https://github.com/jhoang304"><i className="fa-brands fa-github creator-link-icon"></i></a>
          </div>
        </div>
        <div className="creator">
          <span className="creator-text">Bryant Stine</span>
          <div className='creator-icons'>
            <a href="https://www.linkedin.com/in/bryant-stine-447010272/"><i className="fa-brands fa-linkedin creator-link-icon"></i></a>
            <a href="https://github.com/ThatGuyNamedBry"><i className="fa-brands fa-github creator-link-icon"></i></a>
          </div>
        </div>

      </div>
      <div className="footer-col" id="languages">
        <i className="fa-solid fa-code footer-header"></i>
        <span>JavaScript</span>
        <span>React</span>
        <span>Redux</span>
        <span>Python</span>
        <span>Flask</span>
      </div>
      <div className="footer-col" id="for">
        <i className="fa-solid fa-school footer-header"></i>
        <span>App Academy</span>
        <span>August 2023</span>
        <a href="https://github.com/ThatGuyNamedBry/Fortefy-Group-Project">v1.0</a>
      </div>
    </div>
  )
};

export default Footer;

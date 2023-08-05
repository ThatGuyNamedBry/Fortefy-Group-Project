import './Footer.css'

function Footer() {
  return (
    <div id="footer-container">
      <div className="footer-col" id="creators">
        <i className="fa-solid fa-users footer-header"></i>

        <a href="https://www.linkedin.com/in/alexjbasso/">Alex Basso</a>
        <a href="https://www.linkedin.com/in/angad-bhatia/">Angad Bhatia</a>
        <a href="https://www.linkedin.com/in/joshua-hoang-47979426b/">Joshua Hoang</a>
        <a href="https://www.linkedin.com/in/bryant-stine-447010272/">Bryant Stine</a>

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
      </div>
    </div>
  )
};

export default Footer;

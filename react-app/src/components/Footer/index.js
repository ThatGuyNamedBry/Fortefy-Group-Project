import './Footer.css'

function Footer() {

  // Show/Hide icons
  const creatorBlocks = document.querySelectorAll('.creator')

  creatorBlocks.forEach(item => {
    const creatorTextId = item.getAttribute('text-id')
    const creatorText = document.getElementById(creatorTextId)
    const liIconId = item.getAttribute('li-id')
    const linkedinIcon = document.getElementById(liIconId)
    const ghIconId = item.getAttribute('gh-id')
    const ghIcon = document.getElementById(ghIconId)

    item.addEventListener('mouseover', () => {
      creatorText.style.color = 'white'
      linkedinIcon.style.display = 'block';
      ghIcon.style.display = 'block';
    })

    item.addEventListener('mouseout', () => {
      creatorText.style.color = 'rgba(255, 255, 255, 0.465)'
      linkedinIcon.style.display = 'none';
      ghIcon.style.display = 'none';
    })
  })


  return (
    <div id="footer-container">

      <div className="footer-col" id="creators">
        <i className="fa-solid fa-users footer-header"></i>

        <div className="creator" li-id="li-icon-1" gh-id="gh-icon-1" text-id="text-1">
          <span id="text-1" className="creator-text">Alex Basso</span>
          <div className='creator-icons'>
            <a href="https://www.linkedin.com/in/alexjbasso/"><i id="li-icon-1" className="fa fa-linkedin-square creator-link-icon"></i></a>
            <a href="https://github.com/alexjbasso"><i id="gh-icon-1" className="fa fa-github creator-link-icon"></i></a>
          </div>
        </div>
        <div className="creator" li-id="li-icon-2" gh-id="gh-icon-2" text-id="text-2">
          <span id="text-2" className="creator-text">Angad Bhatia</span>
          <div className='creator-icons'>
            <a href="https://www.linkedin.com/in/angad-bhatia/"><i id="li-icon-2" className="fa fa-linkedin-square creator-link-icon"></i></a>
            <a href="https://github.com/Angad-Bhatia"><i id="gh-icon-2" className="fa fa-github creator-link-icon"></i></a>
          </div>
        </div>
        <div className="creator" li-id="li-icon-3" gh-id="gh-icon-3" text-id="text-3">
          <span id="text-3" className="creator-text">Joshua Hoang</span>
          <div className='creator-icons'>
            <a href="https://www.linkedin.com/in/joshua-hoang-47979426b/"><i id="li-icon-3" className="fa fa-linkedin-square creator-link-icon"></i></a>
            <a href="https://github.com/jhoang304"><i id="gh-icon-3" className="fa fa-github creator-link-icon"></i></a>
          </div>
        </div>
        <div className="creator" li-id="li-icon-4" gh-id="gh-icon-4" text-id="text-4">
          <span id="text-4" className="creator-text">Bryant Stine</span>
          <div className='creator-icons'>
            <a href="https://www.linkedin.com/in/bryant-stine-447010272/"><i id="li-icon-4" className="fa fa-linkedin-square creator-link-icon"></i></a>
            <a href="https://github.com/ThatGuyNamedBry"><i id="gh-icon-4" className="fa fa-github creator-link-icon"></i></a>
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

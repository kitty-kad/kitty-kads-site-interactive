export const Socials = (props) => {
  
  return (
    <div>
    <div id='socials' className='text-center intro' style={{background: "#58B2EE", padding: "50px"}}>
        <div className='container text-center'>
          <h2 style={{color:"white"}}>Socials</h2>
          <a style={socialButtonStyle}
            href='https://discord.gg/ac5QDrYmhq'
            className='btn btn-custom btn-lg page-scroll'
          > Discord</a>
                    <a style={socialButtonStyle}
            href='https://twitter.com/KittyKadToken'
            className='btn btn-custom btn-lg page-scroll'
          > Twitter </a>
                    <a style={socialButtonStyle}
            href='https://github.com/kitty-kad'
            className='btn btn-custom btn-lg page-scroll'
          > Github </a>
          <a style={socialButtonStyle}
            href='https://www.reddit.com/r/kittykad/'
            className='btn btn-custom btn-lg page-scroll'
          > Reddit</a>
        </div>
      </div>
    </div>
  )
}

const socialButtonStyle = {
  margin: "20px",
}
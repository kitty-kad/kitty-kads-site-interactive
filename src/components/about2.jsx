import kadena_kad from './../kadena_kad.png';


export const About2 = (props) => {
  return (
    <div id='about' className='text-center' style={{padding: 30}}>
      <div className='container'>
        <div className='row' style={rowStyle}>
          {/* <div className='col-xs-12 col-md-6'>
            {' '}
            <img src={kadena_kad} style={imgStyle} className='img-responsive' alt='' />{' '}
          </div> */}
          <div className='col-xs-12 col-md-12 intro' style={{background:'white'}}>
            <div className=' intro-text'>
              <h2>What are Kitty Kads?</h2>
              <p style={{color:"#777"}}>{props.data ? props.data.paragraph : 'loading...'}
              <br/>
              {props.data ? props.data.paragraph2 : 'loading...'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const rowStyle = {
  width: "100%",
  alignItems: "center",
  justifyContent: "center"
};

// const imgStyle = {
//   marginLeft: "auto",
//   marginRight: "auto",
//   display: "block",
//   paddingBottom: "20px"
// };
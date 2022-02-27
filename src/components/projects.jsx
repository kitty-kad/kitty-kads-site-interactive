export const Projects = (props) => {
  return (
    <div id='projects' className='text-center'>
      <div className='container'>
        <div className='col-md-10 col-md-offset-1 section-title'>
          <h2>Our Other Projects</h2>
        </div>
        <div className='row'>
          {props.data
            ? props.data.map((d, i) => (
              <div key={`${d.title}-${i}`} className='col-sm-6 col-md-3'>
                {' '}
                <i className={d.icon}></i>
                {d.link != null ? 
                <a href={d.link}> <h3 style={{textDecoration: 'underline'}}>{d.title}</h3> </a>
                : <h3>{d.title}</h3>}
                <p>{d.text}</p>
              </div>
            ))
            : 'Loading...'}
        </div>
      </div>
    </div>
  )
}
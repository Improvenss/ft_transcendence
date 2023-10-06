import React from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import Sample from './Sample';

function ForwardedPage()
{
	return (
	  <Router>
		<div>
		  <nav>
			<ul>
			  <li><Link to="/">Ana Sayfa</Link></li>
			  <li><Link to="/about">Hakkımızda</Link></li>
			</ul>
		  </nav>
  
		  {/* <Route path="/" exact component={} /> */}
		  <Route path="/about" element={<Sample/>} />
		</div>
	  </Router>
	);
  };

export default ForwardedPage;
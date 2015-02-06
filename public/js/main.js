var $ = require('jquery-browserify');
var React = require('react/addons');
var foundation = require('./foundation.min.js');
var moment = require('moment');

$(document).foundation();

var SearchBox = React.createClass({
  getInitialState: function() {
    return {query: ''};
  },

  onChange: function(e) {
    this.setState({query: e.target.value});
  },

  handleSubmit: function(e) {
    e.preventDefault();
    this.props.doSearch(this.state.query);
  },

  render: function() {
    return (
      <div className="large-5 columns">
        <div className="row collapse">
          <div className="small-10 columns">
            <input type="text" placeholder="Search for City, Country" onChange={this.onChange} value={this.state.query}/>
          </div>
          <div className="small-2 columns">
            <a href="#" className="button postfix" onClick={this.handleSubmit}><i className="fi-magnifying-glass"/></a>
          </div>
        </div>
      </div>
    );
  }
});


var City = React.createClass({
  getInitialState: function() {
    return {
      query: '',
      units: ''
    };
  },

  fetchData: function() {
    $.get(this.props.source, function(result) {
      if (this.isMounted()) {
        console.log(result);
        this.setState({
          units: 'k'
        });
        this.setProps({
          city: result.name,
          country: result.country,
          temperature: this.convert(result.main.temp, 'f'),
          description: result.weather[0].description,
          humidity: result.main.humidity,
          pressure: result.main.pressure,
          wind: result.wind.speed,
          date: moment(result.dt*1000).fromNow()
        });
      }
    }.bind(this));
  },

  componentDidMount: function() {
    this.fetchData();
  },

  doSearch: function(query) {
    var base_api = 'http://api.openweathermap.org/data/2.5/weather?q='
    this.props.source = base_api + query;
    this.fetchData();

  },

  convert: function(temp, targetUnit) {
    var currentUnit = this.state.units;
    this.setState({
      units: targetUnit
    });
    switch(targetUnit) {
      case 'c': switch(currentUnit) {
        case 'c': return Math.round(temp);              //c->c
        case 'f': return Math.round(((temp-32)*5)/9);   //f->c
        case 'k': return Math.round(temp-273.15);       //k->c
      };
      case 'f': switch(currentUnit) {
        case 'c': return Math.round((temp*9)/5-32);
        case 'f': return Math.round(temp);
        case 'k': return Math.round((temp-273.15)*1.8+32);
      };
      case 'k': switch(currentUnit) {
        case 'c': return Math.round(temp+273.15);
        case 'f': return Math.round((temp+ 459.67) * 5 / 9);
        case 'k': return Math.round(temp);
      };
    }
  },

  render: function() {
    return (
      <div className="city">
        <div className="name">
          <span className="cityName">{this.props.city}</span>
          <span className="countryName">{this.props.name}</span>
        </div>
        <div className="temperature">{this.props.temperature}</div>
        <div className="description">{this.props.description}</div>
        <div className="more">
          <div className="humidity">{this.props.humidity}</div>
          <div className="pressure">{this.props.pressure}</div>
          <div className="wind">{this.props.wind}</div>
          <div className="date">Updated {this.props.date}</div>
        </div>
        <SearchBox query={this.state.query} doSearch={this.doSearch}/>
      </div>

    );
  }
});

React.render(
  <City source="http://api.openweathermap.org/data/2.5/weather?q=nyc,us" />,
  document.getElementById('l1')
);

React.render(
  <City source="http://api.openweathermap.org/data/2.5/weather?q=London,uk" />,
  document.getElementById('l2')
);







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
      city: '',
      country:'',
      temperature:'',
      description:'',
      humidity:'',
      pressure:'',
      wind:'',
      date:'',
      meta: {
        query: ''
      } 
    };
  },

  fetchData: function() {
    $.get(this.props.source, function(result) {
      if (this.isMounted()) {
        this.setState({
          city: result.name,
          country: result.sys.country,
          temperature: this.convert(result.main.temp, 'k', this.props.units),
          description: result.weather[0].description,
          humidity: result.main.humidity,
          pressure: result.main.pressure,
          wind: result.wind.speed,
          date: moment(result.dt*1000).fromNow()
        });
      }
    }.bind(this));
  },

  updateUnits: function(u) {
    this.setState({
      temperature: this.convert(this.state.temperature, u, this.props.units)
    });
  },

  componentDidMount: function() {
    this.fetchData();
  },

  doSearch: function(query) {
    var base_api = 'http://api.openweathermap.org/data/2.5/weather?q='
    this.props.source = base_api + query;
    this.fetchData();

  },

  convert: function(temp, currentUnit, targetUnit) {

    console.log(currentUnit, targetUnit);

    switch(targetUnit) {
      case 'c': switch(currentUnit) {
        case 'c': return Math.round(temp);              //c->c
        case 'f': return Math.round(((temp-32)*5)/9);   //f->c
        case 'k': return Math.round(temp-273.15);       //k->c
      };
      case 'f': switch(currentUnit) {
        case 'c': return Math.round((temp*9)/5+32);
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
          <span className="cityName">{this.state.city},&nbsp;</span>
          <span className="countryName">{this.state.country}</span>
        </div>
        <div className="temperature">{this.state.temperature}</div>
        <div className="description">{this.state.description}</div>
        <div className="more">
          <div className="humidity">{this.state.humidity}</div>
          <div className="pressure">{this.state.pressure}</div>
          <div className="wind">{this.state.wind}</div>
          <div className="date">Updated {this.state.date}</div>
        </div>
        <SearchBox query={this.state.meta.query} doSearch={this.doSearch}/>
      </div>

    );
  }
});


var WeatherApp = React.createClass({
  getInitialState: function() {
    return {units: 'c'};
  },

  flipUnits: function() {
    var prevUnit = this.state.units;
    if (this.state.units === 'c')
      this.setState({units: 'f'}, function(){
        this.refs.city1.updateUnits(prevUnit);
        this.refs.city2.updateUnits(prevUnit);
      });
    else
      this.setState({units: 'c'}, function(){
        this.refs.city1.updateUnits(prevUnit);
        this.refs.city2.updateUnits(prevUnit);
      });
  },

  render: function() {
    return (
      <div>
        <div className="row">
          <div className="large-6 columns">
            <City ref='city1' source="http://api.openweathermap.org/data/2.5/weather?q=nyc,us" units={this.state.units}/>
          </div>
          <div className="large-6 columns">
            <City ref='city2' source="http://api.openweathermap.org/data/2.5/weather?q=London,uk" units={this.state.units} />
          </div>
        </div>
        <div className="row">
          <div className="switch small" tabIndex="0">
            <input id="unitSwitch" onChange={this.flipUnits} type="checkbox"/>
            <label htmlFor="unitSwitch"></label>
            {this.state.units}
          </div>
        </div>
      </div>
    );
  }
});

React.render(<WeatherApp/>, document.getElementById('content'));






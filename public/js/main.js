var $ = require('jquery-browserify');
var React = require('react/addons');
var foundation = require('./foundation.min.js');
var moment = require('moment');
var imgMap = require('./imgMap.js');

$(document).foundation();

var SearchBox = React.createClass({
  getInitialState: function() {
    return {query: '', error: false};
  },

  onChange: function(e) {
    console.log(e);
    this.setState({query: e.target.value});
  },

  handleSubmit: function(e) {
    if(e) e.preventDefault();
    this.props.doSearch(this.state.query);
  },

  onKeyPress: function(e) {
    if(e.charCode === 13)
      this.handleSubmit();
  },

  render: function() {
    return (
      <div className="row search">
        <div className="small-10 columns">
          <input className="searchbox" type="text" placeholder="Search another City" onChange={this.onChange} onKeyPress={this.onKeyPress} value={this.state.query}></input>
        </div>
        <div className="small-2 columns">
          <a href="#" className="button postfix" onClick={this.handleSubmit}><i className="fi-magnifying-glass"/></a>
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
        query: '',
        error: ''
      } 
    };
  },

  fetchData: function() {
    $.get(this.props.source, function(result) {
      console.log(result);
      if(result.cod === '404'){
        this.setState({
        meta: {
          error: 'City not found! Try again with the country name.'
        }
      });
      }
      else if (this.isMounted()) {
        this.setState({
          city: result.name,
          country: result.sys.country,
          temperature: this.convert(result.main.temp, 'c', this.props.units),
          description: result.weather[0].description,
          icon: imgMap[result.weather[0].icon],
          humidity: result.main.humidity,
          pressure: result.main.pressure,
          wind: result.wind.speed,
          date: moment(result.dt*1000).fromNow(),
          meta: {
            error: ''
          }
        });
      }
    }.bind(this))
    .fail(function(error){
      this.setState({
        meta: {
          error: 'Could not connect!'
        }
      });
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
    this.props.source = base_api + query + "&units=metric";
    this.fetchData();

  },

  convert: function(temp, currentUnit, targetUnit) {
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
    var iconClass = "wi " + this.state.icon;
    return (
      <div className="city">
        <div className="name">
          <div className="cityName">{this.state.city}</div>
          <div className="countryName">{this.state.country}</div>
        </div>
        <i className={iconClass}></i>
        <div className="temperature">{this.state.temperature}&deg;</div>
        <div className="description">{this.state.description}</div>
        <div className="row collapse">
          <div className="tile">
            <div className="title">Humidity</div>
            <div className="humidity qty">{this.state.humidity}%</div>
          </div>
          <div className="tile">
            <div className="title">Pressure</div>
            <div className="pressure qty">{this.state.pressure} mb</div>
          </div>
          <div className="tile">
            <div className="title">Wind Speed</div>
            <div className="wind qty">{this.state.wind} km/h</div>
          </div>
        </div>
        <div className="row collapse">
          <div className="tile">
            <div className="date">Updated {this.state.date}</div>
          </div>
        </div>
        <SearchBox query={this.state.meta.query} doSearch={this.doSearch}/>
        <small class="error">{this.state.meta.error}</small>
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
    var unitType = this.state.units === 'f'? 'F': 'C';

    return (
      <div>
        <div className="row main">

          <div className="large-5 large-offset-1 columns">
            <City ref='city1' source="http://api.openweathermap.org/data/2.5/weather?q=nyc,us&units=metric" units={this.state.units}/>
          </div>
          <div className="large-5 large-offset-1 columns">
            <City ref='city2' source="http://api.openweathermap.org/data/2.5/weather?q=London,uk&units=metric" units={this.state.units} />
          </div>
        </div>
        <div className="row controls">
          <div className="switch" tabIndex="0">
            <input id="unitSwitch" onChange={this.flipUnits} type="checkbox"/>
            <label htmlFor="unitSwitch"></label>
            <div className="unitType">&deg;{unitType}</div>
          </div>
        </div>
      </div>
    );
  }
});

React.render(<WeatherApp/>, document.getElementById('content'));






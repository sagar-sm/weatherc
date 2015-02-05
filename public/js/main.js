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
      <div>
        <form onSubmit={this.handleSubmit}>
          <input placeholder="Search for City-Name,Country" onChange={this.onChange} value={this.state.query} />
          <button>'Search'</button>
        </form>
      </div>
    );
  }
});


var City = React.createClass({
  getInitialState: function() {
    return {
      name:'',
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

  componentDidMount: function() {
    $.get(this.props.source, function(result) {
      if (this.isMounted()) {
        this.setState({
          name: result.name,
          temperature: result.main.temp,
          description: result.weather.description,
          humidity: result.main.humidity,
          pressure: result.main.pressure,
          wind: result.wind.speed,
          date: moment(result.dt*1000).fromNow()
        });
      }
    }.bind(this));
  },

  doSearch: function(query) {
    var base_api = 'http://api.openweathermap.org/data/2.5/weather?q='
    this.props.source = base_api + query;

    $.get(this.props.source, function(result) {
      if (this.isMounted()) {
        this.setState({
          name: result.name,
          temperature: result.main.temp,
          description: result.weather.description,
          humidity: result.main.humidity,
          pressure: result.main.pressure,
          wind: result.wind.speed,
          date: moment(result.dt*1000).fromNow()
        });
      }
    }.bind(this));

  },

  render: function() {
    return (
      <div className="city">
        <div className="name">{this.state.name}</div>
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

React.render(
  <City source="http://api.openweathermap.org/data/2.5/weather?q=nyc,us" />,
  document.getElementById('l1')
);

React.render(
  <City source="http://api.openweathermap.org/data/2.5/weather?q=London,uk" />,
  document.getElementById('l2')
);







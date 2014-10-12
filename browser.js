var yaml      = require('js-yaml')
var highlight = require('highlight.js')
var marked    = require('marked')
var renderer  = new marked.Renderer()

renderer.code = function(text, lang){
  if (lang==='graph') {
    return "<div class='graph'>" + text + "</div>"
  }else{
    return marked.Renderer.prototype.code.call(this,text,lang)
  }
}

marked.setOptions({
  renderer    : renderer,
  gfm         : true,
  tables      : true,
  breaks      : false,
  pedantic    : false,
  sanitize    : false,
  smartLists  : false,
  smartypants : false,
  highlight   : function (code) {
    return highlight.highlightAuto(code).value;
  }
})

var blog = angular.module('blog', ['ui.router', 'ngResource', 'ngSanitize'])

blog.config(function($stateProvider, $urlRouterProvider, $locationProvider) {
  $urlRouterProvider.otherwise("/")
  // $locationProvider.html5Mode(true)
  $stateProvider
  .state('home', {
    controller  : 'Home',
    url         : "/",
    templateUrl : "/home/index.html"
  })
  .state('blog', {
    controller  : 'Blog',
    url         : '/blog/:post',
    templateUrl : '/blog/index.html'
  })
})

blog.run(function($rootScope,$timeout,$http){
  $rootScope.nav = "/nav.html"
  $http.get('/blog/index.yaml').then(function(result){
    $rootScope.blogs = yaml.safeLoad(result.data)
  })
})

blog.controller('Blog', function($scope, $stateParams){
  $scope.page = "/blog/" + $stateParams.post
})

blog.controller('Home', function($scope){

})

blog.directive('graph', function(){
  return {
    restrict: 'C',
    link: function(scope, elem, attr){
      console.log('Rendering Graph')

      var height = 200
      var width = elem[0].offsetWidth

      var dataset = yaml.safeLoad(elem.text())
      var force = d3.layout.force()
        .nodes(dataset.nodes)
        .links(dataset.edges)
        .size([width, height])
        .linkDistance([100])
        .charge([-500])
        .start();

      elem.html('')
      var svg = d3.select(elem[0])
        .append('svg')
        .attr('height', height)
        .attr('width', width)

      svg
      .append("defs")
      .append('marker')
      .attr('id', 'arrowhead')
      .attr('markerHeight', 5)
      .attr('markerWidth', 5)
      .attr('markerUnits', 'strokeWidth')
      .attr('orient', 'auto')
      .attr('refX', 0)
      .attr('refY', 0)
      .attr('viewBox', '-5 -5 10 10')
      .append('path')
        .attr('d', 'M 0,0 m -5,-5 L 5,0 L -5,5 Z')
        .attr('fill', '#00f');

      var edges = svg.selectAll('line')
        .data(dataset.edges)
        .enter()
        .append('line')
        .style('stroke', '#ccc')
        .style('stroke-width', 1)
        .attr('marker-end', 'url(#arrowhead)')
        ;

      var nodes = svg.selectAll("circle")
        .data(dataset.nodes)
        .enter()
        .append("circle")
        .attr("r", 10)
        .style("stroke", "#000")
        .style("fill", "#fff")
        .call(force.drag)
        ;

      var labels = svg.selectAll('text')
        .data(dataset.nodes)
        .enter()
        .append('text')
        .text(function(d){
          return d.label
        })
        .attr("font-family", "sans-serif")
        .attr("font-size", "11px")
        .attr("fill", "blue")

      force.on('tick', function(){
        edges.attr("x1", function(d){ return d.source.x })
             .attr("y1", function(d){ return d.source.y })
             .attr("x2", function(d){ return d.target.x })
             .attr("y2", function(d){ return d.target.y })
        nodes.attr("cx", function(d){ return d.x; })
             .attr("cy", function(d){ return d.y; })
        labels
             .attr("x", function(d){ return d.x + 10 })
             .attr("y", function(d){ return d.y + 10 })
      })

    }
  }
})

blog.directive('markdown', function($sanitize, $compile){
  return {
    restrict: 'E',
    link: function (scope, element, attrs) {
      var html = marked(element.text())

      element.html(html)
      $compile(element.contents())(scope)

      MathJax.Hub.Queue(["Typeset", MathJax.Hub, document.body])
    }
  }
})

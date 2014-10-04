var myApp=angular.module('uc5mainModule',['ngRoute'], function($httpProvider) {
  // Use x-www-form-urlencoded Content-Type
  $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
  var param = function(obj) {
    var query = '', name, value, fullSubName, subName, subValue, innerObj, i;      
    for(name in obj) {
      value = obj[name];        
      if(value instanceof Array) {
        for(i=0; i<value.length; ++i) {
          subValue = value[i];
          fullSubName = name + '[' + i + ']';
          innerObj = {};
          innerObj[fullSubName] = subValue;
          query += param(innerObj) + '&';
        }
      }
      else if(value instanceof Object) {
        for(subName in value) {
          subValue = value[subName];
          fullSubName = name + '[' + subName + ']';
          innerObj = {};
          innerObj[fullSubName] = subValue;
          query += param(innerObj) + '&';
        }
      }
      else if(value !== undefined && value !== null)
        query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
    }
      
    return query.length ? query.substr(0, query.length - 1) : query;
  }; 
  // Override $http service's default transformRequest
  $httpProvider.defaults.transformRequest = [function(data) {
    return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
  }];
})
.factory('init_Infor', function() {
			return {	
			    title:"阳光团购网",
				searchword:"",
				city:"上海",
				pinyin:"shanghai",
				siteName:"58团购",
				siteID:"t58",
				ApiTuanUrl:"",
				pageNo:"0",
				orderby:"datetime",
				orderbyName:"最新发布",
				dropClass:"全部分类"
			}})
.factory('init_tuanSites', function() {return {tuanSites:[]}})
.factory('init_citylist', function() {return {citylist:[]}})
.factory('init_tuanlist', function() {return {tuanlist:[]}})
.directive('dirgotop', function($document) {
	return function(scope, element, attr) {
			element.bind('click',function(){
			$("html, body").animate({ scrollTop: 0 }, 120);
			})
		}
	})    
;
		
myApp.config(function($routeProvider){
    $routeProvider.
    when('/citySelect',
    {
         controller:'citySelectCtrl',
         templateUrl:'templates/citySelect.html'
    }).
	 when('/citySelect:id',
    {
         controller:'citySelectCtrl',
         templateUrl:'templates/citySelect.html'
    }).
	  when('/tuanSearch',
    {
         controller:'tuanSearchCtrl',
         templateUrl:'templates/tuanSearch.html'
    }).
	 when('/tuanSite',
    {
         controller:'tuanSiteCtrl',
         templateUrl:'templates/tuanSite.html'
    }).
	 when('/tuanDetail:id',
    {
         controller:'tuanDetailCtrl',
         templateUrl:'templates/tuanDetail.html'
    }).
    when('/',
    {
         controller:'indexCtrl',
         templateUrl:'templates/index.html'
    }).
    otherwise({redirectTo: '/'});//
})
.controller('tuanSiteCtrl',function($scope,$http,init_Infor,init_tuanSites){ 
    $scope.title="团购网站";
	$scope.tuanSites=init_tuanSites.tuanSites;
	$http.get("service/Handler.ashx?type=tuanSites")
	.success(function(response) {
		$scope.tuanSites = response;
		init_tuanSites.tuanSites=response;
		});
	$scope.changetuanSite = function(index) {
				init_Infor.siteName=$scope.tuanSites[index].siteName;
				init_Infor.siteID=$scope.tuanSites[index].siteID;
				init_Infor.pageNo=0;
				console.log(init_Infor.siteName);
				}					
})
.controller('citySelectCtrl',function($scope,$http,init_Infor,init_citylist){
	$scope.title="请选择城市";
	$scope.hotcities=[{name:"北京"},{name:"上海"},{name:"南京"},{name:"杭州"},{name:"重庆"},{name:"西安"},{name:"天津"},{name:"广州"},{name:"上海"},{name:"成都"}];
	$scope.citylist=init_citylist.citylist;
	if($scope.citylist.length==0){
	$http.get("service/Handler.ashx?type=TuanCitys")
	.success(function(response) {			
		$scope.citylist = response;	
		init_citylist.citylist=response;	
		});		   
	}
	$scope.changetuancity = function(name,pinyin) {
				init_Infor.city=name;
				init_Infor.pinyin=pinyin;
				init_Infor.pageNo=0;	
	}
})
.controller('indexCtrl',function($scope,$http,init_Infor,init_tuanSites,init_tuanlist){ 
    $scope.ajaxloading=false;
    $scope.indexinit=init_Infor;
	$scope.tuanSites=init_tuanSites.tuanSites;	
	$scope.tuanInfors=init_tuanlist.tuanlist;
	$scope.pagetuanSize=10;	
	$scope.dropOrders=[{name:"最新发布",value:"datetime"},{name:"人气最高",value:"bought"},{name:"最低价格",value:"pricelow"},{name:"最高价格",value:"pricehigh"}];
	$scope.dropCityLocs=[];//{name:"玉山"},{name:"花桥"}
	$scope.dropClasses=[{name:"全部分类"},{name:"购物"},{name:"电影"}];	
	var gettuanlist=function(){	
	  $scope.ajaxloading=true;	
	  $http.post("service/Handler.ashx",{
		  type:"tuanlist",
		  city:init_Infor.city,
		  tuansite:init_Infor.siteName,
		  pageNo:init_Infor.pageNo,
		  orderby:init_Infor.orderby,
		  dropClass:init_Infor.dropClass
		  })
	  .success(function(response) {
		   $scope.ajaxloading=false;
		  init_Infor.pageNo++;	
		  $scope.pagetuanSize=response.length;
		  console.log(response.length);
			if(init_Infor.pageNo>1){	
			$scope.tuanInfors=$scope.tuanInfors.concat(response);
			init_tuanlist.tuanlist=$scope.tuanInfors;
				}
			else
			{
			$scope.tuanInfors=response;	
			init_tuanlist.tuanlist=response;	
			}
		  })
	.error(function(data, status, headers, config){
                console.log("error");
            });	
	}
	if(init_Infor.pageNo==0)gettuanlist();
	$scope.showpagetuanlist=function(){gettuanlist();};		
	$scope.change_order=function(index){	
	if($scope.dropOrders[index].value!=init_Infor.orderby){
		init_Infor.orderbyName=$scope.dropOrders[index].name;		
		init_Infor.pageNo=0;
		init_Infor.orderby=$scope.dropOrders[index].value;
        gettuanlist();
		}
		};	
	$scope.change_class=function(index){
		if($scope.dropClasses[index].value!=init_Infor.dropClass){
		init_Infor.pageNo=0;
		init_Infor.dropClass=$scope.dropClasses[index].name;
        gettuanlist();
		}
	}	
})
.controller('tuanSearchCtrl',function($scope,init_Infor){  
    $scope.seaClass=init_Infor.dropClass
	$scope.Tags=[{name:"美食"},{name:"电影"},{name:"购物"}];
	$scope.changeclass=function(index){	
	    if(typeof index=="undefined"||index==""){
		  if($("#searchword")!=null&&$("#searchword").val()!=init_Infor.dropClass){
			  init_Infor.dropClass=$("#searchword").val();
			  init_Infor.pageNo=0;
			  }
		}
		else{
		  if($scope.Tags[index].name!=init_Infor.dropClass){
		  init_Infor.pageNo=0;
		  init_Infor.dropClass=$scope.Tags[index].name;
		  }
		}		
	}
})
.controller('tuanDetailCtrl',function($scope, $http, $routeParams){ 
   $scope.title="团购详情";
   $http.get("service/Handler.ashx?type=tuandetail&id="+$routeParams.id)
	.success(function(response) {			
		$scope.tuanInfo = response;	
		});	
})
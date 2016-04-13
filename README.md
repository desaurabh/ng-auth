# ng-auth
This module is build to extend Angular application's where Authorization & Authentication are required.

The module can easily be implemented by configuring 3 basic properties
1. Application roles
2. Authentication endpoints - Authentication endpoints requires 4 important endpoint
- Login
- Authenticate
- Logout	
- Home

3. Global Url - These url's are those which do not require authentication neither any authorization	

#### Example : Basic implementation 		  
```javascript
angular.module('app',['ngAuth'])
.config(function(authServiceProvider){
//define application roles
authServiceProvider.roles=['admin','subordinate','cordinator'];

//adding authentication & redirection endpoints
authServiceProvider.url={
	login:'/login',
	authenticate:'/auth',
	logout:'/logout',
	hoem:'/home'
}

//define global url the url's which do not require authentication or authorization
authServiceProvider.globalUrl=['/page1','page2'];

})
```
#### For UI Authorization the module offers 2 built-in directives
1. Only - This directive used as an attribute &  accepts delimited text to definethe type of user who can view the content.
2. Public - This directive is used to neglect the authorization

#### Directive usage 
```html
<!--content inside this can only be viewed by the user who have admin rights -->
<div only="admin">
</div>

<!--content inside this can only be viewed by the users who have admin/subordinate rights -->
<div only="admin, subordinate"></div>
```

```html
<!--This content does not require any permission or rights-->
<div public>
</div>
```

The module can be downloaded from bower package manager
```shell
bower install angular-2auth
```

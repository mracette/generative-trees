class FirstPersonControls {
	constructor(object, domElement) {
		this.object = object;
		this.target = new THREE.Vector3( 0, 0, 0);
		this.domElement = ( domElement !== undefined ) ? domElement : document;

		this.enabled = true;

		this.movementSpeed = 100;
		this.lookSpeed = 100;

		this.lookVertical = true;
		this.autoForward = false;

		this.activeLook = true;

		this.heightSpeed = false;
		this.heightCoef = 1.0;
		this.heightMin = 0.0;
		this.heightMax = 1.0;

		this.constrainVertical = false;
		this.verticalMin = 0;
		this.verticalMax = Math.PI;

		this.lat = 0;
		this.lon = -90;
		this.phi = 0;
		this.theta = 0;

		this.moveForward = false;
		this.moveBackward = false;
		this.moveLeft = false;
		this.moveRight = false;

		this.lookUp = false;
		this.lookDown = false;
		this.lookLeft = false;
		this.lookRight = false;

		let _onKeyDown = this.bind( this, this.onKeyDown );
		let _onKeyUp = this.bind( this, this.onKeyUp );
		window.addEventListener( 'keydown', _onKeyDown, false );
		window.addEventListener( 'keyup', _onKeyUp, false );
	}

	onKeyDown(event) {
		switch (event.keyCode) {
			case 87: /*W*/ this.moveForward = true; break;
			case 65: /*A*/ this.moveLeft = true; break;
			case 83: /*S*/ this.moveBackward = true; break;
			case 68: /*D*/ this.moveRight = true; break;

			case 38: /*up*/ this.lookUp = true; break;
			case 37: /*left*/ this.lookLeft = true; break;
			case 40: /*down*/ this.lookDown = true; break;
			case 39: /*right*/ this.lookRight = true; break;
		}
	}

	onKeyUp(event) {
		switch (event.keyCode) {
			case 87: /*W*/ this.moveForward = false; break;
			case 65: /*A*/ this.moveLeft = false; break;
			case 83: /*S*/ this.moveBackward = false; break;
			case 68: /*D*/ this.moveRight = false; break;

			case 38: /*up*/ this.lookUp = false; break;
			case 37: /*left*/ this.lookLeft = false; break;
			case 40: /*down*/ this.lookDown = false; break;
			case 39: /*right*/ this.lookRight = false; break;
		}
	}

	update(delta) {
		if ( this.enabled === false ) return;
		
		if ( this.heightSpeed ) {
			var y = THREE.Math.clamp( this.object.position.y, this.heightMin, this.heightMax );
			var heightDelta = y - this.heightMin;
			this.autoSpeedFactor = delta * ( heightDelta * this.heightCoef );
		} else {
			this.autoSpeedFactor = 0.0;
		}

		var actualMoveSpeed = delta * this.movementSpeed;

		if ( this.moveForward || ( this.autoForward && ! this.moveBackward ) ) this.object.translateZ( - ( actualMoveSpeed + this.autoSpeedFactor ) );
		if ( this.moveBackward ) this.object.translateZ( actualMoveSpeed );
		if ( this.moveLeft ) this.object.translateX( - actualMoveSpeed );
		if ( this.moveRight ) this.object.translateX( actualMoveSpeed );
		if ( this.moveUp ) this.object.translateY( actualMoveSpeed );
		if ( this.moveDown ) this.object.translateY( - actualMoveSpeed );

		var actualLookSpeed = delta * this.lookSpeed;

		if ( this.lookUp ) this.lat += actualLookSpeed;
		if ( this.lookDown ) this.lat -= actualLookSpeed;
		if ( this.lookRight ) this.lon += actualLookSpeed; // * verticalLookRatio;
		if ( this.lookLeft ) this.lon -= actualLookSpeed; // * verticalLookRatio;

		this.lat = Math.max( - 85, Math.min( 85, this.lat ) );
		this.phi = THREE.Math.degToRad( 90 - this.lat );
		this.theta = THREE.Math.degToRad( this.lon );

		if ( this.constrainVertical ) {
			this.phi = THREE.Math.mapLinear( this.phi, 0, Math.PI, this.verticalMin, this.verticalMax );
		}

		let targetPosition = this.target;
		let position = this.object.position;

		targetPosition.x = position.x + 100 * Math.sin( this.phi ) * Math.cos( this.theta );
		targetPosition.y = position.y + 100 * Math.cos( this.phi );
		targetPosition.z = position.z + 100 * Math.sin( this.phi ) * Math.sin( this.theta );

		this.object.lookAt(targetPosition);

	}

	dispose() {
		window.removeEventListener( 'keydown', _onKeyDown, false );
		window.removeEventListener( 'keyup', _onKeyUp, false );
	}

	bind(scope, fn) {
		return function () {
			fn.apply( scope, arguments );
		};
	}
}

module.exports = FirstPersonControls;
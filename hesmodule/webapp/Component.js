sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"./model/models",
	"./controller/ErrorHandler"
], function (UIComponent, Device, models, ErrorHandler) {
	"use strict";

	return UIComponent.extend("ypf.hesmodule.Component", {

		metadata : {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * In this function, the device models are set and the router is initialized.
		 * @public
		 * @override
		 */
		init : function () {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// initialize the error handler with the component
			this._oErrorHandler = new ErrorHandler(this);

			// set the device model
			this.setModel(models.createDeviceModel(), "device");

            this.fnCargarDatos();

			// create the views based on the url/hash
			this.getRouter().initialize();
        },
        

        fnCargarDatos: function(){
		////Cache de la cabecera  - GRUIZ - 26-03-2020
		
		var sServiceUrl = "/sap/opu/odata/sap/ZMMPU_OD_HES_APR_SRV/";

		//This code is only needed for testing the application when there is no local proxy available
		var bIsMocked = jQuery.sap.getUriParameters().get("responderOn") === "true";
		// Start the mock server for the domain model
		if (bIsMocked) {
			this._startMockServer(sServiceUrl);
		}
				// Create and set domain model to the component
		var oModel = new sap.ui.model.odata.ODataModel(sServiceUrl, {
			json: true,
			loadMetadataAsync: false
		});
			
		var oListaModel = {
			valores : [{
				ShortText: undefined,
				GrossVal: undefined,
				Currency: undefined,
				SheetNo: undefined,
				Glaccount: undefined,
				Coarea: undefined,
				Costcenter: undefined,
				Order: undefined,
				Frgco: undefined,
				PoNumber: undefined,
				PoItem: undefined,
				PostDate: undefined,
				VendName: undefined
			}]
		};

		oListaModel.valores.pop();
		
		var oDetalleModel = {
			valores : [{
				Sheetno: undefined,
				Shorttextdet: undefined,
				Quantity: undefined,
				Baseuom: undefined,
				Grossvalserv: undefined,
				ExtLine: undefined
			}]
		};
		
		oDetalleModel.valores.pop();
		
		var oAdjuntosModel = {
			valores : [{
				Sheetno: undefined,
				Mimetype: undefined,
				Filename: undefined,
				Adjuntoid: undefined
			}]
		};
		
		oAdjuntosModel.valores.pop();
		//oDetalleModel.valores.push({ShortText:"Alisar camino ofline" , GrossVal:"412.77", Currency:"ARS", SheetNo:"1009133554"});
		
		var oCuentasModel = {
			valores : [{
				Sheetno: undefined,
				NpItem: undefined,
				GlAccount: undefined,
				WbsElem: undefined,
				CoArea: undefined,
				Costcenter: undefined,
				Order: undefined,
				ExtLine: undefined,
				titulo: undefined
			}]
		};
		
		
		//Leer
		var oFilter;
            oFilter = [];
		oModel.read("/HeaderSet/?$expand=N_DetailSet,N_AdjuntosSet,N_AccountSet", {
            filters: oFilter,
            async: false,
            success: function(oData, oResponse) {
            		var that = this;
            		if (oData.results !== undefined){
            			$.each(oData.results, function( key, value ) {
			            	//oListaModel.valores.push({ShortText:"Alisar camino ofline" , GrossVal:"412.77", Currency:"ARS", SheetNo:"1009133554"});
			            	var sValue = parseFloat(value.Grossval).toFixed(2);
			            	var sNpItem = value.PoNumber + " / " + value.PoItem;
			            	
			            	oListaModel.valores.push({ShortText:value.Shorttext , GrossVal:sValue, 
			            		Currency:value.Currency, SheetNo:value.Sheetno, Glaccount:value.Glaccount, Coarea:value.Coarea, Costcenter:value.Costcenter, 
			            		Order:value.Order, Frgco:value.Frgco, PoNumber: value.PoNumber, PoItem: value.PoItem,
			            		PostDate:value.PostDate, VendName: value.VendName 
			            	});
			            	
			            	//detalles value.N_DetailSet
			            	if (value.N_DetailSet.results !== undefined){
				            	$.each(value.N_DetailSet.results, function( key2, value2 ) {
				            		var sValue2 = parseFloat(value2.Grossvalserv).toFixed(2);
				            		oDetalleModel.valores.push({Sheetno:value2.Sheetno , Shorttextdet:value2.Shorttextdet, 
				            		Quantity:value2.Quantity, Baseuom:value2.Baseuom, Grossvalserv:sValue2, ExtLine:value2.ExtLine});
				            	}.bind(that));	
			            	}
			            	
			            	// if (value.Sheetno === "1009133743"){
			            	// 	console.debug("1009133743");
			            	// }
			            	
			            	//adjuntos value.N_AdjuntosSet
			            	if (value.N_AdjuntosSet.results !== undefined){
				            	$.each(value.N_AdjuntosSet.results, function( key3, value3 ) {
				            		oAdjuntosModel.valores.push({Sheetno:value3.SheetNo , Mimetype:value3.Mimetype, Filename:value3.Filename, Adjuntoid:value3.AdjuntoId});
				            	}.bind(that));	
			            	}
			            	
			            	//Cuentas value.N_AccountSet
			            	if (value.N_AccountSet.results !== undefined){
				            	$.each(value.N_AccountSet.results, function( key3, value3 ) {
				            		var sGlAccount = (value3.GlAccount === "") ? "-" : value3.GlAccount;
				            		var sWbsElem = (value3.WbsElem === "") ? "-" : value3.WbsElem;
				            		var sCoArea = (value3.CoArea === "") ? "-" : value3.CoArea;
				            		var sCostcenter = (value3.Costcenter === "") ? "-" : value3.Costcenter;
				            		var sOrder = (value3.Order === "") ? "-" : value3.Order;
				            		
				            		var detalle = $.grep(value.N_DetailSet.results, function(e){ return e.Sheetno === value3.Sheetno; });
									//tomar la 1ra a mostrar
									var pTitulo = detalle[0].Shorttextdet;
									pTitulo = (pTitulo.length === 0) ? "-" : pTitulo;
				            		
				            		
				            		oCuentasModel.valores.push({Sheetno:value3.Sheetno , NpItem:sNpItem,  
				            			GlAccount:sGlAccount, WbsElem:sWbsElem, CoArea:sCoArea,
				            			Costcenter:sCostcenter, Order:sOrder, ExtLine:value3.ExtLine, titulo:pTitulo});
				            			
				            	}.bind(that));	
			            	}
			            	
            			}.bind(that));
            		}

            	}.bind(this)
        	});
		
		this._oCuentasModel = new sap.ui.model.json.JSONModel(oCuentasModel);
		this._oCuentasModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
		this.setModel(this._oCuentasModel, "cuentasModel");
		
		this._oDetalleModel = new sap.ui.model.json.JSONModel(oDetalleModel);
		this._oDetalleModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
		this.setModel(this._oDetalleModel, "detalleModel");
        
        this._oAdjuntosModel = new sap.ui.model.json.JSONModel(oAdjuntosModel);
		this._oAdjuntosModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
		this.setModel(this._oAdjuntosModel, "adjuntosModel");
        
		this._oListaModel = new sap.ui.model.json.JSONModel(oListaModel);
		this._oListaModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
		this.setModel(this._oListaModel, "cabeceraModel");
		
		////Cache de la cabecera
		
		///variable global del titulo de master
		this._nametituloMaster = "";
	},
        

		/**
		 * The component is destroyed by UI5 automatically.
		 * In this method, the ErrorHandler is destroyed.
		 * @public
		 * @override
		 */
		destroy : function () {
			this._oErrorHandler.destroy();
			// call the base component's destroy function
			UIComponent.prototype.destroy.apply(this, arguments);
		},

		/**
		 * This method can be called to determine whether the sapUiSizeCompact or sapUiSizeCozy
		 * design mode class should be set, which influences the size appearance of some controls.
		 * @public
		 * @return {string} css class, either 'sapUiSizeCompact' or 'sapUiSizeCozy' - or an empty string if no css class should be set
		 */
		getContentDensityClass : function() {
			if (this._sContentDensityClass === undefined) {
				// check whether FLP has already set the content density class; do nothing in this case
				// eslint-disable-next-line sap-no-proprietary-browser-api
				if (document.body.classList.contains("sapUiSizeCozy") || document.body.classList.contains("sapUiSizeCompact")) {
					this._sContentDensityClass = "";
				} else if (!Device.support.touch) { // apply "compact" mode if touch is not supported
					this._sContentDensityClass = "sapUiSizeCompact";
				} else {
					// "cozy" in case of touch support; default for most sap.m controls, but needed for desktop-first controls like sap.ui.table.Table
					this._sContentDensityClass = "sapUiSizeCozy";
				}
			}
			return this._sContentDensityClass;
		}

	});

});
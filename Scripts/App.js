myApp = angular.module('myApp', ['ui.bootstrap']);
myApp.service('myService', function ($timeout) {

    this.Alert = function (dialogText, dialogTitle) {
        var alertModal = $('<div id="myModal" class="modal fade" tabindex="-1" role="dialog"> <div class="modal-dialog"> <div class="modal-content" style="width: 80%;"> <div class="modal-header"> <button type="button" class="close" data-dismiss="modal">×</button> <h3>' + (dialogTitle || 'Atencion') + '</h3> </div> <div class="modal-body"><p>' + dialogText + '</p></div><div class="modal-footer"><button class="btn" data-dismiss="modal">Cerrar</button></div></div></div></div>');
        $timeout(function () { alertModal.modal(); });
    };

    this.Confirm = function (dialogText, okFunc, cancelFunc, dialogTitle, but1, but2) {
        var confirmModal = $('<div id="myModal" class="modal fade" tabindex="-1" role="dialog"> <div class="modal-dialog"> <div class="modal-content" style="width: 80%;"> <div class="modal-header"> <button type="button" class="close" data-dismiss="modal">×</button> <h3>' + dialogTitle + '</h3> </div> <div class="modal-body">' + dialogText + '</div><div class="modal-footer"><button ID="SiBtn" class="btn" data-dismiss="modal">' + (but1 == undefined ? 'Si' : but1) + '</button><button ID="NoBtn" class="btn" data-dismiss="modal">' + (but2 == undefined ? 'No' : but2) + '</button></div></div></div></div>');
        confirmModal.find('#SiBtn').click(function (event) {
            okFunc();
            confirmModal.modal('hide');
        });
        confirmModal.find('#NoBtn').click(function (event) {
            cancelFunc();
            confirmModal.modal('hide');
        });
        $timeout(function () { confirmModal.modal(); });
    };
    // bloqueo / desbloqueo de pantalla
    var contadorBloqueo = 0;
    var $dialog = $(
        '<div class="modal fade" data-backdrop="static" data-keyboard="false" tabindex="-1" role="dialog" aria-hidden="true" style="padding-top:15%; overflow-y:visible;">' +
        '<div class="modal-dialog modal-m">' +
        '<div class="modal-content">' +
        '<div class="modal-header"><h3 style="margin:0;">Aguanta la mecha por favor...</h3></div>' +
        '<div class="modal-body">' +
        '<div class="progress progress-striped active" style="margin-bottom:0;"><div class="progress-bar" style="width: 100%"></div></div>' +
        '</div></div></div></div>');

    this.BloquearPantalla = function () {
        contadorBloqueo++;
        if (contadorBloqueo == 1)
            $dialog.modal();
    };
    this.DesbloquearPantalla = function () {
        contadorBloqueo--;
        if (contadorBloqueo == 0)
            $timeout(function () { $dialog.modal('hide'); }, 100); //dentro de un timeout para que angular actualice la pantalla
    };
})
// ref interceptor de peticiones ajax
// usado para interceptar llamadas ajax y para bloquear/desbloquear pantalla y; mostrar msj de error
myApp.factory('myHttpInterceptor', function ($q, myService) {
    // factory retorna un objeto
    var myHttpInterceptor = {
        request: function (config) {
            myService.BloquearPantalla();
            return config;
        },
        requestError: function (config) {
            return config;
        },
        response: function (response) {
            myService.DesbloquearPantalla();
            return response;
        },
        responseError: function (response) {
            myService.DesbloquearPantalla();
            // acceso denegado generado por alguna llamada al servidor (no carga las vistas)
            if (response.status == 404 || response.status == 401) {
                myService.Alert("Acceso Denegado...");
            }
            else if (response.status == 400) {
                myService.Alert("Peticion incorrecta...");
            }
            else if (response.data && response.data.ExceptionMessage) {
                // error desde webapi
                myService.Alert(response.data.ExceptionMessage);
            }
            else {
                myService.Alert("Error en la aplicacion, reintente nuevamente.");
            }
            return $q.reject(response);
        }
    }
    return myHttpInterceptor;
})
    // configura la app con el interceptor antes creado
    .config(function ($httpProvider) {
        //agrega el inteceptor definido anteriormente
        $httpProvider.interceptors.push('myHttpInterceptor');
    });


myApp.run(function ($rootScope, $http, $location, myService) {
    // $rootScope desde donde heredan todos los $scope de los controladores
    // todas las variables o funciones que se definan aquí están disponibles en todos los controladores
    $rootScope.TituloAccionABMC = { A: '(Agregar)', B: '(Eliminar)', M: '(Modificar)', C: '(Consultar)', L: null };
    $rootScope.Mensajes = { SD: ' No se encontraron registros...', RD: ' Revisar los datos ingresados...' };
});

myApp.controller('InicioCtrl', function ($scope) {
});
//Aqui empieza lo groso de simulacion...
myApp.controller('SimulacionTP7', function ($scope, $http, myService) {
    $scope.Horas = 10;
    $scope.hs_ini = 1;
    $scope.hs_fin = 4;
    $scope.Stock_inicial = 10;

    $scope.Media = 3;    
    $scope.EmpMin = 0.5;
    $scope.EmpMax = 1.5;
    $scope.EmpMin2 = 0.5;
    $scope.EmpMax2 = 1.5;
    //RK
    $scope.saltosH = 0.5;
    $scope.tempInicioHorno = 5;
    $scope.constanteMayor = 900;
    $scope.constanteTemp = -0.5;
    //Horno
    $scope.hornoTiempoCoccion = 15;
    $scope.hornoTiempoEnsendido = 45;

    $scope.AccionABMC = 'Pulse Iniciar';   //Funcion inicialmente Muestra Cambio 1.

    //Solo Para mostrar la fila seleccionada
    $scope.setClickedRow = function (index) {
        $scope.selectedRow = index;
    }
        //Funcion de Limpieza de Grilla
    $scope.Limpiar = function () {
        var Evento = 0;
        var Reloj = 0;
		let Reloj_Hora = 0;
        //Cliente
        var RND_LL_Cliente = 0;
        var T_entre_LL_Cliente = 0;
        var Prox_LL_Cliente = 0;
        var Rnd_Cant_Prod = 0;
        var Cantidad_Prod = 0;
        
        //Empleado 1
        var P_Estado_1 = "";
        var P_RND_T_Atencion_1 = 0;
        var P_T_Atencion_1 = 0;
        var P_Hora_Fin_Atencion_1 = 10000000;
        //Empleado 2
        var P_Estado_2 = "";
        var P_RND_T_Atencion_2 = 0;
        var P_T_Atencion_2 = 0;
        var P_Hora_Fin_Atencion_2 = 10000000;
        var Cola = 0;
        var Ac_Clientes_Atendidos = 0;
        var Ac_Clientes_SinAtencion = 0;
        //Horno
        var Stock_Actual = 0;
        var Estado_Horno = 0;
        var Hora_Inicio_Coccion = 0;
        var Tiempo_Coccion = 0;
        var Hora_Fin_Coccion = 0;
        var Proxima_Hora_Coccion_Programada = 0;
        var Hora_Inicio_Espera = 0;
        // Agrego Fila 
        $scope.items = [/*{
            Evento, Reloj, Reloj_Hora, RND_LL_Cliente, T_entre_LL_Cliente, Prox_LL_Cliente, Rnd_Cant_Prod, Cantidad_Prod,
            P_Estado_1, P_RND_T_Atencion_1, P_T_Atencion_1, P_Hora_Fin_Atencion_1, P_Estado_2, P_RND_T_Atencion_2, P_T_Atencion_2, P_Hora_Fin_Atencion_2,
            Cola, Ac_Clientes_Atendidos, Ac_Clientes_SinAtencion, Stock_Actual, Estado_Horno, Hora_Inicio_Coccion, Tiempo_Coccion, Hora_Fin_Coccion, Proxima_Hora_Coccion_Programada, Hora_Inicio_Espera
        }*/];

    }

    $scope.Resumen = function () {
        $scope.AccionABMC = 'R';
    }

    $scope.Volver = function () {
        $scope.AccionABMC = 'L';
    }
        
    $scope.Iniciar = function () {
        params = {
            Horas: $scope.Horas,
            hs_ini: $scope.hs_ini,
            hs_fin: $scope.hs_fin,
            Stock_inicial: $scope.Stock_inicial,

            Media: $scope.Media,
            UniformeMin: $scope.EmpMin,
            UniformeMax: $scope.EmpMax,    
            UniformeMin2: $scope.EmpMin2,
            UniformeMax2: $scope.EmpMax2,    

            saltosH: $scope.saltosH,
            tempInicioHorno: $scope.tempInicioHorno,
            constanteMayor: $scope.constanteMayor,
            constanteTemp: $scope.constanteTemp,

            hornoTiempoCoccion: $scope.hornoTiempoCoccion,
            hornoTiempoEnsendido: $scope.hornoTiempoEnsendido
        };

        $scope.AccionABMC = 'L';

        var Horas = params.Horas;
        var Media = -1 * params.Media;
        
        var UniformeMin = params.UniformeMin; 
        var UniformeMax = params.UniformeMax;

        var UniformeMin2 = params.UniformeMin2;
        var UniformeMax2 = params.UniformeMax2;

        var saltosH = params.saltosH;
        var tempInicioHorno = params.tempInicioHorno;
        var constanteMayor = params.constanteMayor;
        var constanteTemp = params.constanteTemp;
        
        var hornoTiempoCoccion = params.hornoTiempoCoccion;
        var hornoTiempoEnsendido = params.hornoTiempoEnsendido;

        var hs_ini = $scope.hs_ini;
        var hs_fin = $scope.hs_fin;

        var nro = 0;
        var Evento = 'Inicio';
        var Reloj = 0;
        var Reloj_Hora = 0;
        var RND_LL_Cliente = 0;
        var T_entre_LL_Cliente = 0;
        var Prox_LL_Cliente = 0;
        var Rnd_Cant_Prod = 0;
        var Cantidad_Prod = 0;

        var P_Estado_1 = "";
        var P_RND_T_Atencion_1 = 0;
        var P_T_Atencion_1 = 0;
        var P_Hora_Fin_Atencion_1 = 10000000;

        var P_Estado_2 = "";
        var P_RND_T_Atencion_2 = 0;
        var P_T_Atencion_2 = 0;
        var P_Hora_Fin_Atencion_2 = 10000000;

        var Cola = 0;
        var Ac_Clientes_Atendidos = 0;
        var Ac_Clientes_SinAtencion = 0;
        var Stock_Actual = 0;
        var Estado_Horno = "";
        var Hora_Inicio_Coccion = 0;
        var Tiempo_Coccion = 0;
        var Hora_Fin_Coccion = 0;
        var Proxima_Hora_Coccion_Programada = 0;
        var Hora_Inicio_Espera = 0; //Hora inicio espera de cada cliente

  
        var tiempoCocinadoFinal = 0;

        //Array Clientes Hora Inicio
        var Array_Hs_Inicio_Espera = [];

        //Variables temporales
        var Flag_RK_P_45 = 0; //Bandera horno para 45 productos usada en condicion de fin coccion
        var Flag_RK_P_30 = 0; //Bandera horno para 30 productos usada en condicion de fin coccion
        var Contador_ll_Clientes = 0;
        var Ac_Espera_Mayor_a_5 = 0;
        var Ac_Vaciamiento_Cola = 0;

        //Primer Evento 
        if (Reloj == 0) {
            Evento = 'Inicio';
            nro += 1;
            RND_LL_Cliente = Math.random();
            T_entre_LL_Cliente = Math.log(1 - RND_LL_Cliente) * (Media);
            Prox_LL_Cliente = Reloj + T_entre_LL_Cliente;
            //            ;
            P_Estado_1 = "Libre";
            P_RND_T_Atencion_1 = 000;
            P_T_Atencion_1 = 000;
            P_Hora_Fin_Atencion_1 = 10000000;
            //
            P_Estado_2 = "Libre";
            P_RND_T_Atencion_2 = 000;
            P_T_Atencion_2 = 000;
            P_Hora_Fin_Atencion_2 = 10000000;
            Cola = 0;
            Ac_Clientes_Atendidos = 0;
            Ac_Clientes_SinAtencion = 0;
            Stock_Actual = params.Stock_inicial;
            Estado_Horno = "Apagado";
            Hora_Inicio_Coccion = 000;
            // Agrego Fila 
			Reloj_Hora = Reloj / 60;
            if (hs_ini < Reloj_Hora && Reloj_Hora < hs_fin) 
				$scope.items = [{
					nro, Evento, Reloj, Reloj_Hora, RND_LL_Cliente, T_entre_LL_Cliente, Prox_LL_Cliente, Rnd_Cant_Prod, Cantidad_Prod,
					P_Estado_1, P_RND_T_Atencion_1, P_T_Atencion_1, P_Hora_Fin_Atencion_1, P_Estado_2, P_RND_T_Atencion_2, P_T_Atencion_2, P_Hora_Fin_Atencion_2,
					Cola, Ac_Clientes_Atendidos, Ac_Clientes_SinAtencion, Stock_Actual, Estado_Horno, Hora_Inicio_Coccion, Tiempo_Coccion, Hora_Fin_Coccion, Proxima_Hora_Coccion_Programada, Hora_Inicio_Espera
				}];
			else
				$scope.items = [];
        }
        while (Reloj/60 < Horas) {
            Reloj_Anterior = Reloj;

            // Eventos de fin Atencion inicio , fin de coccion e incio de coccion
            if (Hora_Fin_Coccion > 0 && Hora_Fin_Coccion < P_Hora_Fin_Atencion_1 && Hora_Fin_Coccion < P_Hora_Fin_Atencion_2 && Hora_Fin_Coccion < Prox_LL_Cliente) {
                Reloj = Hora_Fin_Coccion;
                Evento = "Fin Cocción";
                nro += 1;
                Estado_Horno = "Apagado";
                Hora_Inicio_Coccion = 0;
                Tiempo_Coccion = 0;
                Hora_Fin_Coccion = 0;
                Proxima_Hora_Coccion_Programada = Reloj + hornoTiempoEnsendido;

                if (Flag_RK_P_45 == 1) {
                    Stock_Actual += 45;
                    Flag_RK_P_45 = 0; //Apago flags de cantidad de prod a cocinar
                }
                else {
                    Stock_Actual += 30;
                    Flag_RK_P_30 = 0
                }
				
				Reloj_Hora = Reloj / 60;
                if (hs_ini < Reloj_Hora && Reloj_Hora < hs_fin) 
					$scope.items.push({
						nro, Evento, Reloj, Reloj_Hora, RND_LL_Cliente, T_entre_LL_Cliente, Prox_LL_Cliente, Rnd_Cant_Prod, Cantidad_Prod,
						P_Estado_1, P_RND_T_Atencion_1, P_T_Atencion_1, P_Hora_Fin_Atencion_1, P_Estado_2, P_RND_T_Atencion_2, P_T_Atencion_2, P_Hora_Fin_Atencion_2,
						Cola, Ac_Clientes_Atendidos, Ac_Clientes_SinAtencion, Stock_Actual, Estado_Horno, Hora_Inicio_Coccion, Tiempo_Coccion, Hora_Fin_Coccion, Proxima_Hora_Coccion_Programada, Hora_Inicio_Espera
					});
                
                // ================================================================
                // Llamar a un cliente de cola si hay, ni bien termina de cocinar
                if (Cola > 0) {
                    Array_Hs_Inicio_Espera.shift();
                    Cola -= 1;
                    // AHora se Genera Atencion!
                    if (Stock_Actual > 0) {
                        //Cantidad de Productos a comprar
                        Rnd_Cant_Prod = Math.random();
                        if (Rnd_Cant_Prod < 0.33) {  Cantidad_Prod = 1; } else if (Rnd_Cant_Prod < 0.66) { Cantidad_Prod = 2; } else if (Rnd_Cant_Prod < 1) { Cantidad_Prod = 3; }
                        // El cliente compra lo que hay
                        Stock_Actual -= Cantidad_Prod;
                        if (Stock_Actual < 0) { Stock_Actual = 0; }
                        P_Estado_1 = "Atendiendo";
                        P_RND_T_Atencion_1 = Math.random();
                        P_T_Atencion_1 = UniformeMin + P_RND_T_Atencion_1 * UniformeMax;
                        P_Hora_Fin_Atencion_1 = P_T_Atencion_1 + Reloj;
                        Evento = "Inicio Atencion de cola";
                        nro += 1;
                        Reloj_Hora = Reloj / 60;
                       if (hs_ini < Reloj_Hora && Reloj_Hora < hs_fin) 
							$scope.items.push({
								nro, Evento, Reloj, Reloj_Hora, RND_LL_Cliente, T_entre_LL_Cliente, Prox_LL_Cliente, Rnd_Cant_Prod, Cantidad_Prod,
								P_Estado_1, P_RND_T_Atencion_1, P_T_Atencion_1, P_Hora_Fin_Atencion_1, P_Estado_2, P_RND_T_Atencion_2, P_T_Atencion_2, P_Hora_Fin_Atencion_2,
								Cola, Ac_Clientes_Atendidos, Ac_Clientes_SinAtencion, Stock_Actual, Estado_Horno, Hora_Inicio_Coccion, Tiempo_Coccion, Hora_Fin_Coccion, Proxima_Hora_Coccion_Programada, Hora_Inicio_Espera
							});
                       // }
                    }
                }
                //||||||||||||||||||  Fin Generacion llamada a cliente de cola |||||||||||||||||||||||||||                 
            } //Fin True hora Fin de Coccion  Ahora verificamos si la hora programada de inicio de coccion ha llegado.
            else if (Proxima_Hora_Coccion_Programada < Prox_LL_Cliente && Estado_Horno == "Apagado") {
                Estado_Horno = "Encendido";
                Hora_Inicio_Coccion = Proxima_Hora_Coccion_Programada;
                //En el sig if definimos Tiempo de coccion por RK y flags por cantidad de producto
                if (Stock_Actual > 0) {
                    Flag_RK_P_30 = 1;
                    //RugenKutta RugenKutta RugenKutta RugenKutta RugenKutta
                    tiempoCocinadoFinal = generarRugenKutta(30, saltosH, 0, tempInicioHorno, constanteTemp, constanteMayor, hornoTiempoCoccion)
                    Tiempo_Coccion = tiempoCocinadoFinal;
                    Hora_Fin_Coccion = Hora_Inicio_Coccion + Tiempo_Coccion;
                    Proxima_Hora_Coccion_Programada = Hora_Fin_Coccion + hornoTiempoEnsendido;
                }
                else {
                    Flag_RK_P_45 = 1;
                    //RugenKutta RugenKutta RugenKutta RugenKutta RugenKutta
                    tiempoCocinadoFinal = generarRugenKutta(45, saltosH, 0, tempInicioHorno, constanteTemp, constanteMayor, hornoTiempoCoccion)
                    Tiempo_Coccion = tiempoCocinadoFinal;
                    Hora_Fin_Coccion = Hora_Inicio_Coccion + Tiempo_Coccion;
                    Proxima_Hora_Coccion_Programada = Hora_Fin_Coccion + hornoTiempoEnsendido;
                }

                if (Hora_Inicio_Coccion < Prox_LL_Cliente && Hora_Inicio_Coccion < P_Hora_Fin_Atencion_1 && Hora_Inicio_Coccion < P_Hora_Fin_Atencion_2) {
                    nro += 1;
                    Evento = "Inicio de Coccion";
                    Reloj = Hora_Inicio_Coccion;
                    // Agrego Fila 
                    Reloj_Hora = Reloj / 60;
                    if (hs_ini < Reloj_Hora && Reloj_Hora < hs_fin) 
						$scope.items.push({
							nro, Evento, Reloj, Reloj_Hora, RND_LL_Cliente, T_entre_LL_Cliente, Prox_LL_Cliente, Rnd_Cant_Prod, Cantidad_Prod,
							P_Estado_1, P_RND_T_Atencion_1, P_T_Atencion_1, P_Hora_Fin_Atencion_1, P_Estado_2, P_RND_T_Atencion_2, P_T_Atencion_2, P_Hora_Fin_Atencion_2,
							Cola, Ac_Clientes_Atendidos, Ac_Clientes_SinAtencion, Stock_Actual, Estado_Horno, Hora_Inicio_Coccion, Tiempo_Coccion, Hora_Fin_Coccion, Proxima_Hora_Coccion_Programada, Hora_Inicio_Espera
						});
                    //}
                }
                //Observar que el RK esta hardcodeado. para ambos stock's

            } // Final  de coccion Programada.

            //  Ahora trataré el Evento Fin Atencion!!!
            while (P_Hora_Fin_Atencion_1 < Prox_LL_Cliente || P_Hora_Fin_Atencion_2 < Prox_LL_Cliente) {
                

                if (P_Hora_Fin_Atencion_1 < Prox_LL_Cliente) {
                    Reloj = P_Hora_Fin_Atencion_1;
                    Evento = "Fin Atención";
                    nro += 1;
                    Ac_Clientes_Atendidos += 1;
                    P_Estado_1 = "Libre";
                    P_Hora_Fin_Atencion_1 = 10000000;
                    P_RND_T_Atencion_1 = 0;
                    P_T_Atencion_1 = 0;
                } else if (P_Hora_Fin_Atencion_2 < Prox_LL_Cliente) {
                    eloj = P_Hora_Fin_Atencion_2;
                    Evento = "Fin Atención";
                    nro += 1;
                    Ac_Clientes_Atendidos += 1;
                    P_Estado_2 = "Libre";
                    P_Hora_Fin_Atencion_2 = 10000000;
                    P_RND_T_Atencion_2 = 0;
                    P_T_Atencion_2 = 0;
                }


                // Agrego Fila 
                Reloj_Hora = Reloj / 60;
                if (hs_ini < Reloj_Hora && Reloj_Hora < hs_fin) 
					$scope.items.push({
						nro, Evento, Reloj, Reloj_Hora, RND_LL_Cliente, T_entre_LL_Cliente, Prox_LL_Cliente, Rnd_Cant_Prod, Cantidad_Prod,
						P_Estado_1, P_RND_T_Atencion_1, P_T_Atencion_1, P_Hora_Fin_Atencion_1, P_Estado_2, P_RND_T_Atencion_2, P_T_Atencion_2, P_Hora_Fin_Atencion_2,
						Cola, Ac_Clientes_Atendidos, Ac_Clientes_SinAtencion, Stock_Actual, Estado_Horno, Hora_Inicio_Coccion, Tiempo_Coccion, Hora_Fin_Coccion, Proxima_Hora_Coccion_Programada, Hora_Inicio_Espera
					});
                // }

                if (Cola > 0) {
                    // Array_Hs_Inicio_Espera.shift();   //Solamente Voy aAtender si Hay Stock sino debo esperar con lo cual no eliminaria ningun objeto del array
                    // Cola -= 1;
                    // AHora se Genera Atencion!
                    if (Stock_Actual > 0) {
                        Array_Hs_Inicio_Espera.shift();
                        Cola -= 1;
                        Rnd_Cant_Prod = Math.random();
                        if (Rnd_Cant_Prod < 0.33) { Cantidad_Prod = 1; } else if (Rnd_Cant_Prod < 0.66) { Cantidad_Prod = 2; } else if (Rnd_Cant_Prod < 1) { Cantidad_Prod = 3; }
                         Stock_Actual -= Cantidad_Prod;
                        if (Stock_Actual < 0) { Stock_Actual = 0; }

                        if (P_Estado_1 == "Libre") {
                            P_Estado_1 = "Atendiendo";
                            P_RND_T_Atencion_1 = Math.random();
                            P_T_Atencion_1 = UniformeMin + P_RND_T_Atencion_1 * UniformeMax;
                            P_Hora_Fin_Atencion_1 = P_T_Atencion_1 + Reloj;
                            Evento = "Inicio Atencion de cola E1";
                            nro += 1;
                        } else if (P_Estado_2 == "Libre") {
                            P_Estado_2 = "Atendiendo";
                            P_RND_T_Atencion_2 = Math.random();
                            P_T_Atencion_2 = UniformeMin2 + P_RND_T_Atencion_2 * UniformeMax2;
                            P_Hora_Fin_Atencion_2 = P_T_Atencion_2 + Reloj;
                            Evento = "Inicio Atencion de cola E2";
                            nro += 1;
                        }
                        
                        // Agrego Fila 
                        Reloj_Hora = Reloj / 60;
                        if (hs_ini < Reloj_Hora && Reloj_Hora < hs_fin) 
							$scope.items.push({
								nro, Evento, Reloj, Reloj_Hora, RND_LL_Cliente, T_entre_LL_Cliente, Prox_LL_Cliente, Rnd_Cant_Prod, Cantidad_Prod,
								P_Estado_1, P_RND_T_Atencion_1, P_T_Atencion_1, P_Hora_Fin_Atencion_1, P_Estado_2, P_RND_T_Atencion_2, P_T_Atencion_2, P_Hora_Fin_Atencion_2,
								Cola, Ac_Clientes_Atendidos, Ac_Clientes_SinAtencion, Stock_Actual, Estado_Horno, Hora_Inicio_Coccion, Tiempo_Coccion, Hora_Fin_Coccion, Proxima_Hora_Coccion_Programada, Hora_Inicio_Espera
							});
                        //}
                    }
                    else {//Else Stock_Actual es = 0
                     //El encendido del Horno lo Controlo en la llegada del cliete y no en el fin de atencion.  
                    }
                }
            }  //Fin Evento fin de atencion While (P_Hora_Fin_Atencion_1 < Prox_LL_Cliente)

            //Siguiente caso de Final de coccion  con tiempo posterior al fin de atencion.
            if (Hora_Fin_Coccion < Prox_LL_Cliente && Hora_Fin_Coccion > 0) {
                Reloj = Hora_Fin_Coccion;
                Evento = "Fin_Coccion";
                nro += 1;
                Estado_Horno = "Apagado";
                Hora_Inicio_Coccion = 0;
                Tiempo_Coccion = 0;
                Hora_Fin_Coccion = 0;
                Proxima_Hora_Coccion_Programada = Reloj + hornoTiempoEnsendido;
                if (Flag_RK_P_45 == 1) {
                    Stock_Actual += 45;
                    Flag_RK_P_45 = 0; //Apago flags de cantidad de prod a cocinar
                }
                else {
                    Stock_Actual += 30;
                    Flag_RK_P_30 = 0
                }

                // Agrego Fila 
                Reloj_Hora = Reloj / 60;
                if (hs_ini < Reloj_Hora && Reloj_Hora < hs_fin) 
					$scope.items.push({
						nro, Evento, Reloj, Reloj_Hora, RND_LL_Cliente, T_entre_LL_Cliente, Prox_LL_Cliente, Rnd_Cant_Prod, Cantidad_Prod,
						P_Estado_1, P_RND_T_Atencion_1, P_T_Atencion_1, P_Hora_Fin_Atencion_1, P_Estado_2, P_RND_T_Atencion_2, P_T_Atencion_2, P_Hora_Fin_Atencion_2,
						Cola, Ac_Clientes_Atendidos, Ac_Clientes_SinAtencion, Stock_Actual, Estado_Horno, Hora_Inicio_Coccion, Tiempo_Coccion, Hora_Fin_Coccion, Proxima_Hora_Coccion_Programada, Hora_Inicio_Espera
					});
                //}
            }
            //====================================
            // EL EVENTO LLEGADA DE CLIENTE 
            //Primero corroborare si hay clientes con mas de 5 cinco min esperando 
            Array_Hs_Inicio_Espera.forEach(Func_Elementos);
            function Func_Elementos(value) {
                if (Prox_LL_Cliente - value > 5 && Stock_Actual ==0) {
                    Array_Hs_Inicio_Espera.shift();
                    Cola -= 1;
                    console.log("Se Elimina por exceso de tiempo de espera :" + value);
                    Ac_Clientes_SinAtencion += 1;
                    Ac_Espera_Mayor_a_5 += 1;
                    Evento = "Cliente s/Atencion espera desde " + value.toFixed(3);
                    Reloj = value + 5;
                    nro += 1;
                    Reloj_Hora = Reloj / 60;
					if (hs_ini < Reloj_Hora && Reloj_Hora < hs_fin) 
						$scope.items.push({
							nro, Evento, Reloj, Reloj_Hora, RND_LL_Cliente, T_entre_LL_Cliente, Prox_LL_Cliente, Rnd_Cant_Prod, Cantidad_Prod,
							P_Estado_1, P_RND_T_Atencion_1, P_T_Atencion_1, P_Hora_Fin_Atencion_1, P_Estado_2, P_RND_T_Atencion_2, P_T_Atencion_2, P_Hora_Fin_Atencion_2,
							Cola, Ac_Clientes_Atendidos, Ac_Clientes_SinAtencion, Stock_Actual, Estado_Horno, Hora_Inicio_Coccion, Tiempo_Coccion, Hora_Fin_Coccion, Proxima_Hora_Coccion_Programada, Hora_Inicio_Espera
						});  
                }
            }

            Evento = 'Llegada de Cliente';
            nro += 1;
            Reloj = Prox_LL_Cliente;
            RND_LL_Cliente = Math.random();
            T_entre_LL_Cliente = Math.log(1 - RND_LL_Cliente) * (Media);
            Prox_LL_Cliente = Reloj + T_entre_LL_Cliente;
            Contador_ll_Clientes += 1; //Contador total de clientes sean o no atendidos.
            //Control de Cola
            if (P_Estado_1 == "Libre" || P_Estado_2 == "Libre") {
                if (Stock_Actual > 0) {
                    //Cantidad de Productos a comprar
                    Rnd_Cant_Prod = Math.random();
                    if (Rnd_Cant_Prod < 0.33) { Cantidad_Prod = 1; } else if (Rnd_Cant_Prod < 0.66) { Cantidad_Prod = 2; } else if (Rnd_Cant_Prod < 1) { Cantidad_Prod = 3; }
                    Stock_Actual -= Cantidad_Prod;

                    if (Stock_Actual < 0) { Stock_Actual = 0; } //En este if cuando se quedan sin stock debo vaciar la cola si hay cola ...

                    if (P_Estado_1 == "Libre") {
                        P_Estado_1 = "Atendiendo";
                        P_RND_T_Atencion_1 = Math.random();
                        P_T_Atencion_1 = UniformeMin + P_RND_T_Atencion_1 * UniformeMax;
                        P_Hora_Fin_Atencion_1 = P_T_Atencion_1 + Reloj;
                    } else if (P_Estado_2 == "Libre") {
                        P_Estado_2 = "Atendiendo";
                        P_RND_T_Atencion_2 = Math.random();
                        P_T_Atencion_2 = UniformeMin + P_RND_T_Atencion_2 * UniformeMax;
                        P_Hora_Fin_Atencion_2 = P_T_Atencion_1 + Reloj;
                    }
                }
                else {//Else Stock Actual es = 0
                    Cola += 1;
                    Array_Hs_Inicio_Espera.push(Reloj);
                    if (Estado_Horno == "Apagado") {
                        Estado_Horno = "Encendido";
                        Hora_Inicio_Coccion = Reloj;
                        Flag_RK_P_45 = 1;
                        //RugenKutta RugenKutta RugenKutta RugenKutta RugenKutta
                        tiempoCocinadoFinal = generarRugenKutta(30, saltosH, 0, tempInicioHorno, constanteTemp, constanteMayor, hornoTiempoCoccion)
                        Tiempo_Coccion = tiempoCocinadoFinal;
                        Hora_Fin_Coccion = Hora_Inicio_Coccion + Tiempo_Coccion;
                        Proxima_Hora_Coccion_Programada = Hora_Fin_Coccion + hornoTiempoEnsendido;
                        nro += 1;
                        Reloj_Hora = Reloj / 60;
                        if (hs_ini < Reloj_Hora && Reloj_Hora < hs_fin) 
							$scope.items.push({
								nro, Evento, Reloj, Reloj_Hora, RND_LL_Cliente, T_entre_LL_Cliente, Prox_LL_Cliente, Rnd_Cant_Prod, Cantidad_Prod,
								P_Estado_1, P_RND_T_Atencion_1, P_T_Atencion_1, P_Hora_Fin_Atencion_1, P_Estado_2, P_RND_T_Atencion_2, P_T_Atencion_2, P_Hora_Fin_Atencion_2,
								Cola, Ac_Clientes_Atendidos, Ac_Clientes_SinAtencion, Stock_Actual, Estado_Horno, Hora_Inicio_Coccion, Tiempo_Coccion, Hora_Fin_Coccion, Proxima_Hora_Coccion_Programada, Hora_Inicio_Espera
							});
                        //}
                    }
                }
            } //Fin if true panadero libre
            else { //Panadero esta atendiendo
                Cola += 1;
                Array_Hs_Inicio_Espera.push(Reloj);
            } //FIn Panadero Libre


            // } FIn If Cola >0 de tratamient de cliente
            Reloj_Hora = Reloj / 60;
            if (hs_ini < Reloj_Hora && Reloj_Hora < hs_fin) 
				$scope.items.push({
					nro, Evento, Reloj, Reloj_Hora, RND_LL_Cliente, T_entre_LL_Cliente, Prox_LL_Cliente, Rnd_Cant_Prod, Cantidad_Prod,
					P_Estado_1, P_RND_T_Atencion_1, P_T_Atencion_1, P_Hora_Fin_Atencion_1, P_Estado_2, P_RND_T_Atencion_2, P_T_Atencion_2, P_Hora_Fin_Atencion_2,
					Cola, Ac_Clientes_Atendidos, Ac_Clientes_SinAtencion, Stock_Actual, Estado_Horno, Hora_Inicio_Coccion, Tiempo_Coccion, Hora_Fin_Coccion, Proxima_Hora_Coccion_Programada, Hora_Inicio_Espera
				});
            //}
        } //Llave Cierre de While

        Evento = 'FIN ATENCION';
        Reloj = $scope.Horas * 60;
		Reloj_Hora = $scope.Horas;
		if (hs_ini < Reloj_Hora && Reloj_Hora < hs_fin)
			$scope.items.push({
				nro, Evento, Reloj, Reloj_Hora, RND_LL_Cliente, T_entre_LL_Cliente, Prox_LL_Cliente, Rnd_Cant_Prod, Cantidad_Prod,
				P_Estado_1, P_RND_T_Atencion_1, P_T_Atencion_1, P_Hora_Fin_Atencion_1, P_Estado_2, P_RND_T_Atencion_2, P_T_Atencion_2, P_Hora_Fin_Atencion_2,
				Cola, Ac_Clientes_Atendidos, Ac_Clientes_SinAtencion, Stock_Actual, Estado_Horno, Hora_Inicio_Coccion, Tiempo_Coccion, Hora_Fin_Coccion, Proxima_Hora_Coccion_Programada, Hora_Inicio_Espera
			});

        //Resumen
        $scope.Contador_ll_Clientes = Contador_ll_Clientes;
        $scope.Proporcion = ((Ac_Clientes_SinAtencion) / Contador_ll_Clientes ) * 100;
        $scope.Proporcion_Atendidos = (Ac_Clientes_Atendidos / Contador_ll_Clientes) * 100;
        $scope.Atendidos = Ac_Clientes_Atendidos;
        $scope.No_Atendidos = Ac_Clientes_SinAtencion;
        $scope.Esperas = Ac_Espera_Mayor_a_5;
        $scope.Vaciamiento = Ac_Vaciamiento_Cola;


        // k : 30 o 40
        // h : 0.5
        // To: 0
        // Po: 5 (temp inicio de horno)
        // ct: constante t
        // cp: constante P
        // it: iteraciones
        function generarRugenKutta(k, h, To, Po, ct, cp, it) {
            var tFinal = 0;
            rungeKutta = new RungeKutta(k, h, To, Po, ct, cp);
            do {
                if (tFinal == 0) {
                    var aux = false;
                    var contador = 0;
                    var salir_rk = false;
                    var corte_rk = false;
                }
                //calculamos los Ki
                rungeKutta.calcularKi();
                //calculo el Pi+1
                rungeKutta.calcularProxP();

                tFinal = rungeKutta.getT();

                var proxT = rungeKutta.getT() + rungeKutta.getH();
                var proxP = rungeKutta.getProxP();

                rungeKutta.setT(proxT);
                rungeKutta.setP(proxP);

                if (aux === false) {
                    aux = true;
                    corte_rk = proxP.toFixed(9);
                }
                if (corte_rk === proxP.toFixed(9)) {
                    contador = contador + 1;
                    // 15 iteraciones
                    if (contador == it) {
                        salir_rk = true;
                    }
                }
                else {
                    corte_rk = proxP.toFixed(9);
                    contador = 0;
                }                
            } while (salir_rk === false)
            return tFinal;
        }
    }



    //============================================================================
    // RUGE KUTTRA RUGE KUTTRA RUGE KUTTRA  RUGE KUTTRA RUGE KUTTRA RUGE KUTTRA //
    //============================================================================
    function RungeKutta(k, h, To, Po, ct, cp) {
        this.k = parseFloat(k);
        this.h = parseFloat(h);
        this.T = parseFloat(To);
        this.P = parseFloat(Po);

        this.ct = parseFloat(ct);
        this.cp = parseFloat(cp);

        this.k1 = 0;
        this.k2 = 0;
        this.k3 = 0;
        this.k4 = 0;
        this.Pprox;
    }
    

    RungeKutta.prototype.calcularProxP = function () {
        this.Pprox = (this.P + ((this.h / 6) * (this.k1 + 2 * this.k2 + 2 * this.k3 + this.k4))).toFixed(9);
        this.Pprox = parseFloat(this.Pprox);
    }

    RungeKutta.prototype.calcularKi = function () {

        this.k1 = this.f(this.T, this.P).toFixed(12);
        this.k2 = this.f((this.T + (this.h / 2)), (this.P + ((this.h / 2) * this.k1))).toFixed(12);
        this.k3 = this.f((this.T + (this.h / 2)), (this.P + ((this.h / 2) * this.k2))).toFixed(12);
        this.k4 = this.f((this.T + (this.h / 2)), (this.P + (this.h * this.k3))).toFixed(12);

        this.k1 = parseFloat(this.k1);
        this.k2 = parseFloat(this.k2);
        this.k3 = parseFloat(this.k3);
        this.k4 = parseFloat(this.k4);
    }

    RungeKutta.prototype.f = function (T, P) {
        return (this.ct * P + this.cp / this.k);
    }

    RungeKutta.prototype.setT = function (T) { this.T = T; }

    RungeKutta.prototype.setP = function (P) { this.P = P; }

    RungeKutta.prototype.getK = function ()  { return this.k; }

    RungeKutta.prototype.getK1 = function () { return this.k1; }

    RungeKutta.prototype.getK2 = function () { return this.k2; }

    RungeKutta.prototype.getK3 = function () { return this.k3; }

    RungeKutta.prototype.getK4 = function () { return this.k4; }

    RungeKutta.prototype.getH = function ()  { return this.h; }

    RungeKutta.prototype.getT = function ()  { return this.T; }

    RungeKutta.prototype.getP = function ()  { return this.P; }

    RungeKutta.prototype.getProxP = function () { return this.Pprox; }


});
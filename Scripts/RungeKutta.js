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

RungeKutta.prototype.getK = function () { return this.k; }

RungeKutta.prototype.getK1 = function () { return this.k1; }

RungeKutta.prototype.getK2 = function () { return this.k2; }

RungeKutta.prototype.getK3 = function () { return this.k3; }

RungeKutta.prototype.getK4 = function () { return this.k4; }

RungeKutta.prototype.getH = function () { return this.h; }

RungeKutta.prototype.getT = function () { return this.T; }

RungeKutta.prototype.getP = function () { return this.P; }

RungeKutta.prototype.getProxP = function () { return this.Pprox; }
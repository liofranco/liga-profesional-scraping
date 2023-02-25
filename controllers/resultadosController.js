import * as cheerio from "cheerio";
import axios from "axios";
import { teams } from "../teams.js";

const homeData = (req,res) => {
    axios.get(`https://www.resultados-futbol.com/primera_division_argentina`)
        .then(response => {
            const $ = cheerio.load(response.data)
            const tabla = $('#tabla2 tbody tr')
            const listaPartidos = $('tbody .vevent')
            const cantFechas = $('#col-resultados .boxtop .bar_jornada #desplega_jornadas ul li')
            const fechaActual = $('#col-resultados .boxtop .bar_jornada .journey-simple .j_cur a').text().slice(8)
            const listaGoleadores = $('#informacion-goleadores .contentitem #goleadores table tbody .fila')
            const listaAmarillas = $('#informacion-goleadores .contentitem #tarjetas1 table tbody .fila')
            const listaRojas = $('#informacion-goleadores .contentitem #tarjetas2 table tbody .fila')
            const listaAsistencias = $('#informacion-goleadores .contentitem #assists table tbody .fila')

            let cantidadFechas = 0
            let posiciones = []
            let partidos = []
            let goleadores = []
            let amarillas = []
            let rojas = []
            let asistencias = []

            cantFechas.each((i,el) => {
                cantidadFechas += 1
            })
            
            tabla.each((i,el) => {
                const pos = $(el).find('tr th').text()
                const escudo = $(el).find('tr .equipo img').attr('src')
                const equipo = $(el).find('tr .equipo img').attr('alt')
                const puntos = $(el).find('tr .pts').text()
                const jugados = $(el).find('tr .pj').text()
                const ganados = $(el).find('tr .win').text()
                const empatados = $(el).find('tr .draw').text()
                const perdidos = $(el).find('tr .lose').text()
                const favor = parseInt($(el).find('tr .f').text())
                const contra = parseInt($(el).find('tr .c').text())
                const diferencia = favor-contra
                const ultimos5 = $(el).find('tr td .leyendaresultados .tooltip')
                const r = $(el).find('tr td .leyendaresultados .tooltip .classicsmall ul li')
                const ultimos = []
                const forma = []
                ultimos5.each((i,el) => {
                    const v = $(el).hasClass('form-win')
                    const e = $(el).hasClass('form-draw')
                    const d = $(el).hasClass('form-loss')
                    ultimos.push({
                        v: v,
                        e: e,
                        d: d,
                        rival: ''
                    })
                })
                ultimos5.each((i,el) => {
                    let result = ''
                    const v = $(el).hasClass('form-win')
                    const e = $(el).hasClass('form-draw')
                    const d = $(el).hasClass('form-loss')
                    if(v){
                        result = 'V'
                    } else if(e){
                        result = 'E'
                    } else if(d){
                        result = 'D'
                    }
                    forma.push({
                        result: result
                    })
                })
                let rivales = []
                r.each((i,elem) => {
                    const eq = $(elem).find('.bname').text()
                    if(!equipo.includes(eq.slice(0,-2)) && eq.length > 0){
                        rivales = [...rivales, eq]
                    }
                })
                ultimos.forEach((u,i) => {
                    u.rival = rivales[i]
                })
                posiciones.push({
                    rank: pos,
                    team: {
                        name: equipo,
                        logo: escudo
                    },
                    points: puntos,
                    played: jugados,
                    win: ganados,
                    draw: empatados,
                    lose: perdidos,
                    goalsDiff: diferencia,
                    form: forma
                })
            })
        
            listaPartidos.each((i, el) => {
                const local = $(el).find('.equipo1 a').text()
                const visitante = $(el).find('.equipo2 a').text()
                const localEscudo = $(el).find('.equipo1 a img').attr('src').slice(0,-11)
                const visitanteEscudo = $(el).find('.equipo2 a img').attr('src').slice(0,-11)
                const tiempo = $(el).find('.fecha .fecha-status').text()
                const resultado = $(el).find('.rstd a .clase').text()
                const guion = resultado.indexOf('-')
                let golLocal = resultado.slice(0, guion)
                let golVisitante = resultado.slice(guion+1)
                const date = $(el).find('.fecha').attr('data-date')
                const link = $(el).find('.cmm .c').attr('href')

                const teamHome = teams.find(t => t.name === local)
                const teamAway = teams.find(t => t.name === visitante)
        
                partidos.push({
                    id: `23${fechaActual}${teamHome.id}${teamAway.id}`,
                    date: date,
                    link:`https://www.resultados-futbol.com${link}`,
                    route: link,
                    score: resultado,
                    status: tiempo,
                    teams: {
                        home: {
                            id: teamHome.id,
                            name: local,
                            code: teamHome.code,
                            logo: localEscudo
                        },
                        away: {
                            id: teamAway.id,
                            name: visitante,
                            code: teamAway.code,
                            logo: visitanteEscudo                       
                        }
                    },
                    goals:{
                        home: golLocal,
                        away: golVisitante
                    },
                    stadium: teamHome.stadium
                })
            })

            listaGoleadores.each((i,el) => {
                const pos = $(el).find('.numr').text()
                const img = $(el).find('td img').attr('src')
                const nombre = $(el).find('td a').attr('title')
                const cantidad = $(el).find('td strong').text()
                const equipo = $(el).find('.esp a').attr('title')
                const escudo = $(el).find('.esp img').attr('src')
                goleadores.push({
                    pos,
                    img,
                    nombre,
                    cantidad,
                    equipo,
                    escudo
                })
            })

            listaAmarillas.each((i,el) => {
                const pos = $(el).find('.numr').text()
                const img = $(el).find('td img').attr('src')
                const nombre = $(el).find('td a').attr('title')
                const cantidad = $(el).find('td strong').text()
                const equipo = $(el).find('.esp a').attr('title')
                const escudo = $(el).find('.esp img').attr('src')
                amarillas.push({
                    pos,
                    img,
                    nombre,
                    cantidad,
                    equipo,
                    escudo
                })
            })

            listaRojas.each((i,el) => {
                const pos = $(el).find('.numr').text()
                const img = $(el).find('td img').attr('src')
                const nombre = $(el).find('td a').attr('title')
                const cantidad = $(el).find('td strong').text()
                const equipo = $(el).find('.esp a').attr('title')
                const escudo = $(el).find('.esp img').attr('src')
                rojas.push({
                    pos,
                    img,
                    nombre,
                    cantidad,
                    equipo,
                    escudo
                })
            })

            listaAsistencias.each((i,el) => {
                const pos = $(el).find('.numr').text()
                const img = $(el).find('td img').attr('src')
                const nombre = $(el).find('td a').attr('title')
                const cantidad = $(el).find('td strong').text()
                const equipo = $(el).find('.esp a').attr('title')
                const escudo = $(el).find('.esp img').attr('src')
                asistencias.push({
                    pos,
                    img,
                    nombre,
                    cantidad,
                    equipo,
                    escudo
                })
            })

            res.send({
                status: "success",
                rounds: {
                    current: fechaActual,
                    total: cantidadFechas
                },
                ranking: posiciones,
                partidos,
                statistics: [
                    {
                        name: 'Goles',
                        ranking: goleadores
                    },
                    {
                        name: 'Asistencias',
                        ranking: asistencias
                    },
                    {
                        name: 'Tarjetas amarillas',
                        ranking: amarillas
                    },
                    {
                        name: 'Tarjetas rojas',
                        ranking: rojas
                    }
                ]
            })

    }).catch(err => console.error(err) )
}

const roundData = async (req,res) => {
    let round = req.params.round;
    axios.get(`https://www.resultados-futbol.com/primera_division_argentina/grupo1/jornada${round}`)
        .then(response => {
            const $ = cheerio.load(response.data)
            const listaPartidos = $('tbody .vevent')

            let partidos = []
        
            listaPartidos.each((i, el) => {
                const local = $(el).find('.equipo1 a').text()
                const visitante = $(el).find('.equipo2 a').text()
                const localEscudo = $(el).find('.equipo1 a img').attr('src').slice(0,-11)
                const visitanteEscudo = $(el).find('.equipo2 a img').attr('src').slice(0,-11)
                const tiempo = $(el).find('.fecha .fecha-status').text()
                const resultado = $(el).find('.rstd a .clase').text()
                const guion = resultado.indexOf('-')
                let golLocal = resultado.slice(0, guion)
                let golVisitante = resultado.slice(guion+1)
                const date = $(el).find('.fecha').attr('data-date')
                const link = $(el).find('.cmm .c').attr('href')
                const teamHome = teams.find(t => t.name === local)
                const teamAway = teams.find(t => t.name === visitante)

                partidos.push({
                    id: `23${round}${teamHome.id}${teamAway.id}`,
                    date: date,
                    link:`https://www.resultados-futbol.com${link}`,
                    route: link,
                    score: resultado,
                    status: tiempo,
                    teams: {
                        home: {
                            id: teamHome.id,
                            name: local,
                            code: teamHome.code,
                            logo: localEscudo
                        },
                        away: {
                            id: teamAway.id,
                            name: visitante,
                            code: teamAway.code,
                            logo: visitanteEscudo                       
                        }
                    },
                    goals:{
                        home: golLocal,
                        away: golVisitante
                    },
                    stadium: teamHome.stadium
                })
            })

            res.send({
                status: "success",
                partidos
            })

        }).catch(err => console.error(err) )

}

const currentRound = (req,res) => {
        axios.get(`https://www.resultados-futbol.com/primera_division_argentina`)
        .then(response => {
            const $ = cheerio.load(response.data)
            const listaPartidos = $('tbody .vevent')
            const fechaActual = $('#col-resultados .boxtop .bar_jornada .journey-simple .j_cur a').text().slice(8)

            let partidos = []
        
            listaPartidos.each((i, el) => {
                const local = $(el).find('.equipo1 a').text()
                const visitante = $(el).find('.equipo2 a').text()
                const localEscudo = $(el).find('.equipo1 a img').attr('src').slice(0,-11)
                const visitanteEscudo = $(el).find('.equipo2 a img').attr('src').slice(0,-11)
                const tiempo = $(el).find('.fecha .fecha-status').text()
                const resultado = $(el).find('.rstd a .clase').text()
                const guion = resultado.indexOf('-')
                let golLocal = resultado.slice(0, guion)
                let golVisitante = resultado.slice(guion+1)
                const date = $(el).find('.fecha').attr('data-date')
                const link = $(el).find('.cmm .c').attr('href')
                const teamHome = teams.find(t => t.name === local)
                const teamAway = teams.find(t => t.name === visitante)
        
                partidos.push({
                    id: `23${fechaActual}${teamHome.id}${teamAway.id}`,
                    date: date,
                    link:`https://www.resultados-futbol.com${link}`,
                    route: link,
                    score: resultado,
                    status: tiempo,
                    teams: {
                        home: {
                            id: teamHome.id,
                            name: local,
                            code: teamHome.code,
                            logo: localEscudo
                        },
                        away: {
                            id: teamAway.id,
                            name: visitante,
                            code: teamAway.code,
                            logo: visitanteEscudo                       
                        }
                    },
                    goals:{
                        home: golLocal,
                        away: golVisitante
                    },
                    stadium: teamHome.stadium
                })
            })

            res.send({
                status: "success",
                round: fechaActual, 
                fixture: partidos
            })

    }).catch(err => console.error(err) )
}

const teamsList = (req,res) => {
    axios.get(`https://www.resultados-futbol.com/primera_division_argentina`)
        .then(response => {
            const $ = cheerio.load(response.data)
            const lista = $('.shields-liga li')
            const list = []
            lista.each((i,el)=>{
                const name = $(el).find('a img').attr('alt')
                const logo = $(el).find('a img').attr('src')
                list.push({
                    name: name,
                    img: logo
                })
            })

            res.send({
                status: "success",
                teams: list.sort((a,b) => a.name.localeCompare(b.name)) 
            })

        }).catch(err => console.error(err) )
}

export { homeData, roundData, currentRound, teamsList }
/**
 * msmdadabit - Extension MakeCode (micro:bit)
 * DaDa:bit + WonderCam (via dadabit)
 *
 * Objectif :
 *  - Garder les blocs caméra + mission existants
 *  - Ajouter mouvements simples + réglages + demi-tour robuste + macros
 */

//% color=#00BCD4 icon="\uf085" block="msmdadabit"
//% groups='["Init","Réglages","Capteurs","Mouvements","Suivi de ligne","Vision (WonderCam)","Bras","Macros (sans caméra)","Mission"]'
namespace msmdadabit {
    // =========================================================
    // CAPTEURS LIGNE (internes)
    // =========================================================
    let S1 = false
    let S2 = false
    let S3 = false
    let S4 = false

    // =========================================================
    // ETAT MISSION
    // =========================================================
    // 0 = reconnaissance (chercher/approcher) / 1 = livraison (destination)
    let phase = 0
    let nextCount = 0

    // =========================================================
    // PARAMETRES CAMERA (par défaut = tes seuils)
    // =========================================================
    let X_MIN = 80
    let X_MAX = 240
    let Y_CLOSE = 237
    let VALIDATIONS = 8

    // =========================================================
    // VITESSES (réglables)
    // =========================================================
    let vToutDroit = 55
    let vCorrection = 44
    let vPetit = 33

    // =========================================================
    // SERVOS BRAS (réglables)
    // =========================================================
    let SERVO_ARM = 5   // 270°
    let SERVO_GRIP = 6  // 270°

    let brasHaut = -60
    let brasBas = -5
    let pinceOuverte = 15
    let pinceFermee = -25

    // Etat manipulation (utile pour macros sans caméra)
    let porteObjet = false

    // =========================================================
    // OUTILS MOTEURS (internes)
    // =========================================================
    function stopInterne(): void {
        dadabit.setLego360Servo(1, dadabit.Oriention.Counterclockwise, 0)
        dadabit.setLego360Servo(2, dadabit.Oriention.Clockwise, 0)
        dadabit.setLego360Servo(3, dadabit.Oriention.Counterclockwise, 0)
        dadabit.setLego360Servo(4, dadabit.Oriention.Clockwise, 0)
    }

    function avancerInterne(v: number): void {
        dadabit.setLego360Servo(1, dadabit.Oriention.Counterclockwise, v)
        dadabit.setLego360Servo(2, dadabit.Oriention.Clockwise, v)
        dadabit.setLego360Servo(3, dadabit.Oriention.Counterclockwise, v)
        dadabit.setLego360Servo(4, dadabit.Oriention.Clockwise, v)
    }

    function reculerInterne(v: number): void {
        dadabit.setLego360Servo(1, dadabit.Oriention.Clockwise, v)
        dadabit.setLego360Servo(2, dadabit.Oriention.Counterclockwise, v)
        dadabit.setLego360Servo(3, dadabit.Oriention.Clockwise, v)
        dadabit.setLego360Servo(4, dadabit.Oriention.Counterclockwise, v)
    }

    // Pivot sur place à droite (spin)
    function pivoterDroiteInterne(v: number): void {
        dadabit.setLego360Servo(1, dadabit.Oriention.Clockwise, v)
        dadabit.setLego360Servo(2, dadabit.Oriention.Counterclockwise, v)
        dadabit.setLego360Servo(3, dadabit.Oriention.Clockwise, v)
        dadabit.setLego360Servo(4, dadabit.Oriention.Counterclockwise, v)
    }

    // Pivot sur place à gauche (spin)
    function pivoterGaucheInterne(v: number): void {
        dadabit.setLego360Servo(1, dadabit.Oriention.Counterclockwise, v)
        dadabit.setLego360Servo(2, dadabit.Oriention.Clockwise, v)
        dadabit.setLego360Servo(3, dadabit.Oriention.Counterclockwise, v)
        dadabit.setLego360Servo(4, dadabit.Oriention.Clockwise, v)
    }

    // Virage en arc (plus doux) : ralentir un côté
    function tournerGaucheArcInterne(v: number): void {
        // gauche plus lent, droite plus rapide
        dadabit.setLego360Servo(1, dadabit.Oriention.Counterclockwise, Math.max(0, v - 15))
        dadabit.setLego360Servo(3, dadabit.Oriention.Counterclockwise, Math.max(0, v - 15))
        dadabit.setLego360Servo(2, dadabit.Oriention.Clockwise, v)
        dadabit.setLego360Servo(4, dadabit.Oriention.Clockwise, v)
    }

    function tournerDroiteArcInterne(v: number): void {
        // droite plus lent, gauche plus rapide
        dadabit.setLego360Servo(2, dadabit.Oriention.Clockwise, Math.max(0, v - 15))
        dadabit.setLego360Servo(4, dadabit.Oriention.Clockwise, Math.max(0, v - 15))
        dadabit.setLego360Servo(1, dadabit.Oriention.Counterclockwise, v)
        dadabit.setLego360Servo(3, dadabit.Oriention.Counterclockwise, v)
    }

    // =========================================================
    // INIT
    // =========================================================

    /**
     * Initialise DaDa:bit + WonderCam (mode détection couleur) et position bras.
     */
    //% blockId=msm_aihandler_init
    //% block="initialiser AI Handler (DaDa:bit + WonderCam)"
    //% group="Init"
    export function init(): void {
        dadabit.dadabit_init()
        wondercam.wondercam_init(wondercam.DEV_ADDR.x32)
        wondercam.ChangeFunc(wondercam.Functions.ColorDetect)

        phase = 0
        nextCount = 0
        porteObjet = false

        dadabit.setLego270Servo(SERVO_ARM, brasHaut, 300)
        dadabit.setLego270Servo(SERVO_GRIP, pinceOuverte, 300)
        basic.pause(500)
        stopInterne()
    }

    // =========================================================
    // REGLAGES
    // =========================================================

    //% blockId=msm_aihandler_set_speeds
    //% block="régler vitesses suivi tout droit %vd correction %vc petit %vp"
    //% vd.defl=55 vc.defl=44 vp.defl=33
    //% group="Réglages"
    export function setLineSpeeds(vd: number = 55, vc: number = 44, vp: number = 33): void {
        vToutDroit = vd
        vCorrection = vc
        vPetit = vp
    }

    //% blockId=msm_aihandler_set_arm_ports
    //% block="régler ports servos bras %bras pince %pince"
    //% bras.defl=5 pince.defl=6
    //% group="Réglages"
    export function setArmPorts(bras: number = 5, pince: number = 6): void {
        SERVO_ARM = bras
        SERVO_GRIP = pince
    }

    //% blockId=msm_aihandler_set_arm_angles
    //% block="régler angles bras haut %bh bras bas %bb pince ouverte %po pince fermée %pf"
    //% bh.defl=-60 bb.defl=-5 po.defl=15 pf.defl=-25
    //% group="Réglages"
    export function setArmAngles(bh: number = -60, bb: number = -5, po: number = 15, pf: number = -25): void {
        brasHaut = bh
        brasBas = bb
        pinceOuverte = po
        pinceFermee = pf
    }

    // (optionnel mais utile si tu veux rendre la caméra “paramétrable”)
    //% blockId=msm_aihandler_set_cam_thresholds
    //% block="régler seuils caméra Xmin %xmin Xmax %xmax Yproche %y validations %val"
    //% xmin.defl=80 xmax.defl=240 y.defl=237 val.defl=8
    //% group="Réglages"
    export function setCameraThresholds(xmin: number = 80, xmax: number = 240, y: number = 237, val: number = 8): void {
        X_MIN = xmin
        X_MAX = xmax
        Y_CLOSE = y
        VALIDATIONS = val
    }

    // =========================================================
    // CAPTEURS
    // =========================================================

    /**
     * Met à jour les capteurs de ligne (S1..S4) pour une ligne noire sur fond clair.
     */
    //% blockId=msm_aihandler_update_line
    //% block="mettre à jour capteurs de ligne (noir)"
    //% group="Capteurs"
    export function updateLineSensors(): void {
        S1 = dadabit.line_followers(dadabit.LineFollowerSensors.S1, dadabit.LineColor.Black)
        S2 = dadabit.line_followers(dadabit.LineFollowerSensors.S2, dadabit.LineColor.Black)
        S3 = dadabit.line_followers(dadabit.LineFollowerSensors.S3, dadabit.LineColor.Black)
        S4 = dadabit.line_followers(dadabit.LineFollowerSensors.S4, dadabit.LineColor.Black)
    }

    //% blockId=msm_aihandler_get_sensor
    //% block="capteur %sensor sur noir ?"
    //% sensor.defl=dadabit.LineFollowerSensors.S2
    //% group="Capteurs"
    export function isOnBlack(sensor: dadabit.LineFollowerSensors): boolean {
        if (sensor == dadabit.LineFollowerSensors.S1) return S1
        if (sensor == dadabit.LineFollowerSensors.S2) return S2
        if (sensor == dadabit.LineFollowerSensors.S3) return S3
        return S4
    }

    //% blockId=msm_aihandler_at_destination
    //% block="destination atteinte ? (S1,S2,S3,S4 sur noir)"
    //% group="Capteurs"
    export function atDestination(): boolean {
        return S1 && S2 && S3 && S4
    }

    // =========================================================
    // MOUVEMENTS (nouveaux blocs)
    // =========================================================

    //% blockId=msm_move_stop
    //% block="stopper le robot"
    //% group="Mouvements"
    export function stop(): void {
        stopInterne()
    }

    //% blockId=msm_move_forward
    //% block="avancer vitesse %v"
    //% v.defl=55
    //% group="Mouvements"
    export function forward(v: number = 55): void {
        avancerInterne(v)
    }

    //% blockId=msm_move_backward
    //% block="reculer vitesse %v"
    //% v.defl=55
    //% group="Mouvements"
    export function backward(v: number = 55): void {
        reculerInterne(v)
    }

    //% blockId=msm_move_turn_left
    //% block="tourner à gauche (arc) vitesse %v"
    //% v.defl=55
    //% group="Mouvements"
    export function turnLeft(v: number = 55): void {
        tournerGaucheArcInterne(v)
    }

    //% blockId=msm_move_turn_right
    //% block="tourner à droite (arc) vitesse %v"
    //% v.defl=55
    //% group="Mouvements"
    export function turnRight(v: number = 55): void {
        tournerDroiteArcInterne(v)
    }

    //% blockId=msm_move_pivot_left
    //% block="pivoter à gauche (sur place) vitesse %v"
    //% v.defl=44
    //% group="Mouvements"
    export function pivotLeft(v: number = 44): void {
        pivoterGaucheInterne(v)
    }

    //% blockId=msm_move_pivot_right
    //% block="pivoter à droite (sur place) vitesse %v"
    //% v.defl=44
    //% group="Mouvements"
    export function pivotRight(v: number = 44): void {
        pivoterDroiteInterne(v)
    }

    /**
     * Demi-tour robuste (recalage ligne), inspiré de ton code testé.
     */
    //% blockId=msm_move_u_turn
    //% block="faire demi-tour (recalage ligne) vitesse %v"
    //% v.defl=44
    //% group="Mouvements"
    export function uTurn(v: number = 44): void {
        // Lancer une rotation de départ
        pivoterDroiteInterne(v)
        basic.pause(500)

        // Recalage : tourner jusqu’à retrouver un pattern stable
        updateLineSensors()
        while (S1 || S2 || !(S3 && S4)) {
            dadabit.setLego360Servo(1, dadabit.Oriention.Counterclockwise, v)
            dadabit.setLego360Servo(2, dadabit.Oriention.Counterclockwise, v)
            dadabit.setLego360Servo(3, dadabit.Oriention.Counterclockwise, v)
            dadabit.setLego360Servo(4, dadabit.Oriention.Counterclockwise, v)
            updateLineSensors()
        }
        stopInterne()
    }

    // =========================================================
    // SUIVI DE LIGNE (ROBUSTE + TESTE)
    // =========================================================

    //% blockId=msm_aihandler_line_follow
    //% block="suivre la ligne (mode compétition)"
    //% group="Suivi de ligne"
    export function lineFollowGeneral(): void {
        if (S2 && S3) {
            dadabit.setLego360Servo(1, dadabit.Oriention.Counterclockwise, vToutDroit)
            dadabit.setLego360Servo(2, dadabit.Oriention.Clockwise, vToutDroit)
            dadabit.setLego360Servo(3, dadabit.Oriention.Counterclockwise, vToutDroit)
            dadabit.setLego360Servo(4, dadabit.Oriention.Clockwise, vToutDroit)

        } else if (S1 && S2 && (!S3 && !S4)) {
            dadabit.setLego360Servo(1, dadabit.Oriention.Clockwise, vCorrection)
            dadabit.setLego360Servo(2, dadabit.Oriention.Clockwise, vCorrection)
            dadabit.setLego360Servo(3, dadabit.Oriention.Clockwise, vCorrection)
            dadabit.setLego360Servo(4, dadabit.Oriention.Clockwise, vCorrection)

        } else if (S3 && S4 && (!S1 && !S2)) {
            dadabit.setLego360Servo(1, dadabit.Oriention.Counterclockwise, vCorrection)
            dadabit.setLego360Servo(2, dadabit.Oriention.Counterclockwise, vCorrection)
            dadabit.setLego360Servo(3, dadabit.Oriention.Counterclockwise, vCorrection)
            dadabit.setLego360Servo(4, dadabit.Oriention.Counterclockwise, vCorrection)

        } else if (S2 && !S1 && (!S3 && !S4)) {
            dadabit.setLego360Servo(1, dadabit.Oriention.Counterclockwise, vCorrection)
            dadabit.setLego360Servo(2, dadabit.Oriention.Clockwise, vPetit)
            dadabit.setLego360Servo(3, dadabit.Oriention.Counterclockwise, vCorrection)
            dadabit.setLego360Servo(4, dadabit.Oriention.Clockwise, vPetit)

        } else if (S3 && !S1 && (!S2 && !S4)) {
            dadabit.setLego360Servo(1, dadabit.Oriention.Counterclockwise, vPetit)
            dadabit.setLego360Servo(2, dadabit.Oriention.Clockwise, vCorrection)
            dadabit.setLego360Servo(3, dadabit.Oriention.Counterclockwise, vPetit)
            dadabit.setLego360Servo(4, dadabit.Oriention.Clockwise, vCorrection)

        } else if (S1 && !S2 && (!S3 && !S4)) {
            dadabit.setLego360Servo(1, dadabit.Oriention.Clockwise, vToutDroit)
            dadabit.setLego360Servo(2, dadabit.Oriention.Clockwise, vToutDroit)
            dadabit.setLego360Servo(3, dadabit.Oriention.Clockwise, vToutDroit)
            dadabit.setLego360Servo(4, dadabit.Oriention.Clockwise, vToutDroit)

        } else if (S4 && !S1 && (!S2 && !S3)) {
            dadabit.setLego360Servo(1, dadabit.Oriention.Counterclockwise, vToutDroit)
            dadabit.setLego360Servo(2, dadabit.Oriention.Counterclockwise, vToutDroit)
            dadabit.setLego360Servo(3, dadabit.Oriention.Counterclockwise, vToutDroit)
            dadabit.setLego360Servo(4, dadabit.Oriention.Counterclockwise, vToutDroit)
        }
    }

    // =========================================================
    // VISION (WONDERCAM)
    // =========================================================

    //% blockId=msm_aihandler_update_cam
    //% block="mettre à jour WonderCam"
    //% group="Vision (WonderCam)"
    export function updateCamera(): void {
        wondercam.UpdateResult()
    }

    //% blockId=msm_aihandler_color_centered
    //% block="couleur ID %id détectée et centrée ?"
    //% id.min=1 id.max=7 id.defl=1
    //% group="Vision (WonderCam)"
    export function isColorCentered(id: number): boolean {
        if (!wondercam.isDetectedColorId(id)) return false
        const x = wondercam.XOfColorId(wondercam.Options.Pos_X, id)
        return x >= X_MIN && x <= X_MAX
    }

    //% blockId=msm_aihandler_color_y
    //% block="Y de couleur ID %id"
    //% id.min=1 id.max=7 id.defl=1
    //% group="Vision (WonderCam)"
    export function colorY(id: number): number {
        if (!wondercam.isDetectedColorId(id)) return -1
        return wondercam.XOfColorId(wondercam.Options.Pos_Y, id)
    }

    // =========================================================
    // BRAS
    // =========================================================

    //% blockId=msm_arm_home
    //% block="position de départ du bras"
    //% group="Bras"
    export function armHome(): void {
        dadabit.setLego270Servo(SERVO_ARM, brasHaut, 300)
        dadabit.setLego270Servo(SERVO_GRIP, pinceOuverte, 300)
        basic.pause(300)
        porteObjet = false
    }

    //% blockId=msm_aihandler_grab
    //% block="attraper l'objet"
    //% group="Bras"
    export function grab(): void {
        stopInterne()
        basic.pause(500)

        dadabit.setLego270Servo(SERVO_ARM, brasBas, 500)
        basic.pause(800)

        dadabit.setLego270Servo(SERVO_GRIP, pinceFermee, 500)
        basic.pause(800)

        dadabit.setLego270Servo(SERVO_ARM, brasHaut, 500)
        basic.pause(800)

        porteObjet = true
        phase = 1
    }

    //% blockId=msm_aihandler_drop
    //% block="déposer l'objet"
    //% group="Bras"
    export function drop(): void {
        stopInterne()
        basic.pause(500)

        dadabit.setLego270Servo(SERVO_ARM, brasBas, 500)
        basic.pause(800)

        dadabit.setLego270Servo(SERVO_GRIP, pinceOuverte, 500)
        basic.pause(800)

        dadabit.setLego270Servo(SERVO_ARM, brasHaut, 500)
        basic.pause(800)

        porteObjet = false
        phase = 0
    }

    //% blockId=msm_arm_carrying
    //% block="porte un objet ?"
    //% group="Bras"
    export function isCarryingObject(): boolean {
        return porteObjet
    }

    // =========================================================
    // MACROS (sans caméra)
    // =========================================================

    //% blockId=msm_macro_beep
    //% block="bip validation"
    //% group="Macros (sans caméra)"
    export function beepValidation(): void {
        music.play(music.tonePlayable(262, music.beat(BeatFraction.Whole)), music.PlaybackMode.UntilDone)
    }

    //% blockId=msm_macro_manage_destination
    //% block="si destination alors déposer puis demi-tour vitesse %v"
    //% v.defl=44
    //% group="Macros (sans caméra)"
    export function manageDestinationNoCamera(v: number = 44): void {
        updateLineSensors()
        if (atDestination()) {
            if (porteObjet) drop()
            uTurn(v)
        }
    }

    //% blockId=msm_macro_cycle_no_camera
    //% block="cycle suiveur de ligne sans caméra"
    //% group="Macros (sans caméra)"
    export function cycleNoCamera(): void {
        updateLineSensors()
        lineFollowGeneral()
        if (porteObjet && atDestination()) {
            drop()
            uTurn(vCorrection)
        }
    }

    // =========================================================
    // MISSION (logique helper caméra)
    // =========================================================

    //% blockId=msm_aihandler_get_phase
    //% block="phase mission (0=reconnaissance,1=livraison)"
    //% group="Mission"
    export function getPhase(): number {
        return phase
    }

    //% blockId=msm_aihandler_set_phase
    //% block="définir phase mission à %p"
    //% p.min=0 p.max=1 p.defl=0
    //% group="Mission"
    export function setPhase(p: number): void {
        phase = (p == 1) ? 1 : 0
        nextCount = 0
    }

    /**
     * Approche l’objet couleur ID : stable VALIDATIONS fois + centrage X, puis avance jusqu’à Y_CLOSE, puis grab().
     * Retourne true si attrapage effectué.
     */
    //% blockId=msm_aihandler_approach_and_grab
    //% block="si couleur ID %id détectée (stable) alors approcher & attraper"
    //% id.min=1 id.max=7 id.defl=1
    //% group="Mission"
    export function approachAndGrabIfColor(id: number): boolean {
        if (phase != 0) return false

        if (wondercam.isDetectedColorId(id)) {
            const x = wondercam.XOfColorId(wondercam.Options.Pos_X, id)
            if (x >= X_MIN && x <= X_MAX) {
                nextCount += 1

                if (nextCount > VALIDATIONS) {
                    nextCount = 0
                    beepValidation()

                    while (wondercam.isDetectedColorId(id) && wondercam.XOfColorId(wondercam.Options.Pos_Y, id) < Y_CLOSE) {
                        updateCamera()
                        updateLineSensors()
                        lineFollowGeneral()
                    }

                    grab()
                    return true
                }
            }
        }
        return false
    }
}

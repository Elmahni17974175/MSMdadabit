//% color=#00bcd4 icon="\uf1b9" block="MSMdadabit"
//% groups='["Initialisation","Capteurs ligne","Suivi de ligne","Camera","Bras et pince","Destination","Macros PRO"]'
namespace msmdadabit {

    // =========================================================
    // ETAT : LIGNE (4 capteurs)
    // =========================================================
    let capteur1 = false
    let capteur2 = false
    let capteur3 = false
    let capteur4 = false

    // =========================================================
    // ETAT : VITESSES (valeurs qui marchent)
    // =========================================================
    let v_tout_droit = 55
    let v_correction = 44
    let v_petit = 33

    // =========================================================
    // ETAT : CAMERA (couleur ID)
    // =========================================================
    let id_couleur = 1
    let x_min = 80
    let x_max = 240
    let y_approche = 237
    let nb_validations = 8
    let compteur_stabilite = 0

    // =========================================================
    // ETAT : BRAS / PINCE
    // =========================================================
    let servo_bras = 5
    let servo_pince = 6
    let bras_haut = -60
    let bras_bas = -5
    let pince_ouverte = 15
    let pince_fermee = -25

    let porte_objet = false

    // =========================================================
    // OUTILS MOTEURS (internes) - mêmes sens que ton code
    // =========================================================
    function moteurs_stop(): void {
        dadabit.setLego360Servo(1, dadabit.Oriention.Clockwise, 0)
        dadabit.setLego360Servo(2, dadabit.Oriention.Clockwise, 0)
        dadabit.setLego360Servo(3, dadabit.Oriention.Clockwise, 0)
        dadabit.setLego360Servo(4, dadabit.Oriention.Clockwise, 0)
    }

    function moteurs_avancer(v: number): void {
        // AVANCER (comme ton code)
        dadabit.setLego360Servo(1, dadabit.Oriention.Counterclockwise, v)
        dadabit.setLego360Servo(2, dadabit.Oriention.Clockwise, v)
        dadabit.setLego360Servo(3, dadabit.Oriention.Counterclockwise, v)
        dadabit.setLego360Servo(4, dadabit.Oriention.Clockwise, v)
    }

    // tourner gauche/droite selon ton algo “fiable”
    function tourner_gauche_fort(v: number): void {
        // tous clockwise (comme ton code quand ligne à gauche)
        dadabit.setLego360Servo(1, dadabit.Oriention.Clockwise, v)
        dadabit.setLego360Servo(2, dadabit.Oriention.Clockwise, v)
        dadabit.setLego360Servo(3, dadabit.Oriention.Clockwise, v)
        dadabit.setLego360Servo(4, dadabit.Oriention.Clockwise, v)
    }

    function tourner_droite_fort(v: number): void {
        // tous counterclockwise (comme ton code quand ligne à droite)
        dadabit.setLego360Servo(1, dadabit.Oriention.Counterclockwise, v)
        dadabit.setLego360Servo(2, dadabit.Oriention.Counterclockwise, v)
        dadabit.setLego360Servo(3, dadabit.Oriention.Counterclockwise, v)
        dadabit.setLego360Servo(4, dadabit.Oriention.Counterclockwise, v)
    }

    function correction_sens_gauche(): void {
        // Sensor2 seul => corriger à gauche (v_correction vs v_petit)
        dadabit.setLego360Servo(1, dadabit.Oriention.Counterclockwise, v_correction)
        dadabit.setLego360Servo(2, dadabit.Oriention.Clockwise, v_petit)
        dadabit.setLego360Servo(3, dadabit.Oriention.Counterclockwise, v_correction)
        dadabit.setLego360Servo(4, dadabit.Oriention.Clockwise, v_petit)
    }

    function correction_sens_droite(): void {
        // Sensor3 seul => corriger à droite (v_petit vs v_correction)
        dadabit.setLego360Servo(1, dadabit.Oriention.Counterclockwise, v_petit)
        dadabit.setLego360Servo(2, dadabit.Oriention.Clockwise, v_correction)
        dadabit.setLego360Servo(3, dadabit.Oriention.Counterclockwise, v_petit)
        dadabit.setLego360Servo(4, dadabit.Oriention.Clockwise, v_correction)
    }

    // rotation sur place (droite / gauche) utile pour rechercher/recentrer
    function rotation_droite(v: number): void {
        dadabit.setLego360Servo(1, dadabit.Oriention.Clockwise, v)
        dadabit.setLego360Servo(2, dadabit.Oriention.Counterclockwise, v)
        dadabit.setLego360Servo(3, dadabit.Oriention.Clockwise, v)
        dadabit.setLego360Servo(4, dadabit.Oriention.Counterclockwise, v)
    }

    function rotation_gauche(v: number): void {
        dadabit.setLego360Servo(1, dadabit.Oriention.Counterclockwise, v)
        dadabit.setLego360Servo(2, dadabit.Oriention.Clockwise, v)
        dadabit.setLego360Servo(3, dadabit.Oriention.Counterclockwise, v)
        dadabit.setLego360Servo(4, dadabit.Oriention.Clockwise, v)
    }

    // =========================================================
    // INITIALISATION
    // =========================================================
    //% group="Initialisation"
    //% blockId=msm_init
    //% block="initialiser MSMdadabit (ID %id bras %bras pince %pince)"
    //% id.defl=1 bras.defl=5 pince.defl=6
    export function initialiser(id: number = 1, bras: number = 5, pince: number = 6): void {
        dadabit.dadabit_init()

        id_couleur = id
        servo_bras = bras
        servo_pince = pince

        // Camera : on initialise ici (extension autonome)
        wondercam.wondercam_init(wondercam.DEV_ADDR.x32)
        wondercam.ChangeFunc(wondercam.Functions.ColorDetect)

        // position départ bras/pince
        dadabit.setLego270Servo(servo_bras, bras_haut, 300)
        dadabit.setLego270Servo(servo_pince, pince_ouverte, 300)

        porte_objet = false
        compteur_stabilite = 0

        basic.pause(400)
    }

    //% group="Initialisation"
    //% blockId=msm_regler_vitesses
    //% block="regler vitesses (tout droit %vd correction %vc petit %vp)"
    //% vd.defl=55 vc.defl=44 vp.defl=33
    export function reglerVitesses(vd: number = 55, vc: number = 44, vp: number = 33): void {
        v_tout_droit = vd
        v_correction = vc
        v_petit = vp
    }

    //% group="Initialisation"
    //% blockId=msm_regler_camera
    //% block="regler camera (X %xmin-%xmax Y %y validations %n)"
    //% xmin.defl=80 xmax.defl=240 y.defl=237 n.defl=8
    export function reglerCamera(xmin: number = 80, xmax: number = 240, y: number = 237, n: number = 8): void {
        x_min = xmin
        x_max = xmax
        y_approche = y
        nb_validations = n
        compteur_stabilite = 0
    }

    // =========================================================
    // CAPTEURS LIGNE
    // =========================================================
    //% group="Capteurs ligne"
    //% blockId=msm_maj_ligne
    //% block="mettre a jour ligne"
    export function mettreAJourLigne(): void {
        capteur1 = dadabit.line_followers(dadabit.LineFollowerSensors.S1, dadabit.LineColor.Black)
        capteur2 = dadabit.line_followers(dadabit.LineFollowerSensors.S2, dadabit.LineColor.Black)
        capteur3 = dadabit.line_followers(dadabit.LineFollowerSensors.S3, dadabit.LineColor.Black)
        capteur4 = dadabit.line_followers(dadabit.LineFollowerSensors.S4, dadabit.LineColor.Black)
    }

    //% group="Destination"
    //% blockId=msm_destination
    //% block="arrive a destination"
    export function arriveDestination(): boolean {
        return (capteur1 && capteur2 && capteur3 && capteur4)
    }

    // =========================================================
    // SUIVI DE LIGNE (ALGO FIABLE = ton code)
    // =========================================================
    //% group="Suivi de ligne"
    //% blockId=msm_suivre_ligne
    //% block="suivre la ligne (fiable)"
    export function suivreLigne(): void {
        // suppose: mettreAJourLigne() a été appelé
        if (capteur2 && capteur3) {
            moteurs_avancer(v_tout_droit)

        } else if (capteur1 && capteur2 && (!capteur3 && !capteur4)) {
            tourner_gauche_fort(v_correction)

        } else if (capteur3 && capteur4 && (!capteur1 && !capteur2)) {
            tourner_droite_fort(v_correction)

        } else if (capteur2 && !capteur1 && !capteur3 && !capteur4) {
            correction_sens_gauche()

        } else if (capteur3 && !capteur1 && !capteur2 && !capteur4) {
            correction_sens_droite()

        } else if (capteur1 && !capteur2 && !capteur3 && !capteur4) {
            tourner_gauche_fort(v_tout_droit)

        } else if (capteur4 && !capteur1 && !capteur2 && !capteur3) {
            tourner_droite_fort(v_tout_droit)
        }
    }

    // =========================================================
    // CAMERA
    // =========================================================
    //% group="Camera"
    //% blockId=msm_maj_camera
    //% block="mettre a jour camera"
    export function mettreAJourCamera(): void {
        wondercam.UpdateResult()
    }

    //% group="Camera"
    //% blockId=msm_cube_detecte
    //% block="cube detecte"
    export function cubeDetecte(): boolean {
        return wondercam.isDetectedColorId(id_couleur)
    }

    //% group="Camera"
    //% blockId=msm_cube_centre_x
    //% block="cube centre en X"
    export function cubeCentreEnX(): boolean {
        if (!cubeDetecte()) return false
        const x = wondercam.XOfColorId(wondercam.Options.Pos_X, id_couleur)
        return (x >= x_min && x <= x_max)
    }

    //% group="Camera"
    //% blockId=msm_cube_stable
    //% block="cube stable"
    export function cubeStable(): boolean {
        if (cubeCentreEnX()) compteur_stabilite++
        else compteur_stabilite = 0
        return compteur_stabilite >= nb_validations
    }

    // =========================================================
    // BRAS / PINCE
    // =========================================================
    //% group="Bras et pince"
    //% blockId=msm_attraper
    //% block="attraper l objet"
    export function attraperObjet(): void {
        moteurs_stop()
        basic.pause(300)

        dadabit.setLego270Servo(servo_bras, bras_bas, 500)
        basic.pause(800)

        dadabit.setLego270Servo(servo_pince, pince_fermee, 500)
        basic.pause(800)

        dadabit.setLego270Servo(servo_bras, bras_haut, 500)
        basic.pause(800)

        porte_objet = true
    }

    //% group="Bras et pince"
    //% blockId=msm_deposer
    //% block="deposer l objet"
    export function deposerObjet(): void {
        moteurs_stop()
        basic.pause(300)

        dadabit.setLego270Servo(servo_bras, bras_bas, 500)
        basic.pause(800)

        dadabit.setLego270Servo(servo_pince, pince_ouverte, 500)
        basic.pause(800)

        dadabit.setLego270Servo(servo_bras, bras_haut, 500)
        basic.pause(800)

        porte_objet = false
    }

    //% group="Bras et pince"
    //% blockId=msm_porte_objet
    //% block="porte un objet"
    export function porteUnObjet(): boolean {
        return porte_objet
    }

    // =========================================================
    // DESTINATION (style code officiel)
    // - déposer si on porte un objet
    // - puis reculer / tourner jusqu'à reprendre la ligne
    // =========================================================
    //% group="Destination"
    //% blockId=msm_gerer_destination
    //% block="gerer destination (vitesse %v)"
    //% v.defl=44
    export function gererDestination(v: number = 44): void {
        if (!arriveDestination()) return

        moteurs_stop()
        basic.pause(500)

        // déposer si on porte
        if (porte_objet) {
            deposerObjet()
            compteur_stabilite = 0
        }

        // séquence type "destination" : reculer puis tourner jusqu'à retrouver ligne (S3&S4)
        // reculer un peu
        dadabit.setLego360Servo(1, dadabit.Oriention.Clockwise, v)
        dadabit.setLego360Servo(2, dadabit.Oriention.Counterclockwise, v)
        dadabit.setLego360Servo(3, dadabit.Oriention.Clockwise, v)
        dadabit.setLego360Servo(4, dadabit.Oriention.Counterclockwise, v)
        basic.pause(500)

        // tourner (sur place) jusqu'à ce que la ligne soit sous les capteurs 3 et 4
        mettreAJourLigne()
        while (capteur1 || capteur2 || !(capteur3 && capteur4)) {
            tourner_droite_fort(v)   // comme ton code de référence (tous CCW dans la boucle)
            mettreAJourLigne()
        }

        moteurs_stop()
        basic.pause(100)
    }

    // =========================================================
    // MACROS PRO (compétition)
    // =========================================================
    //% group="Macros PRO"
    //% blockId=msm_bip
    //% block="bip validation"
    export function bipValidation(): void {
        music.play(music.tonePlayable(262, music.beat(BeatFraction.Whole)), music.PlaybackMode.UntilDone)
    }

    //% group="Macros PRO"
    //% blockId=msm_recentrer_cube
    //% block="recentrer cube (vitesse %v timeout(ms) %t)"
    //% v.defl=25 t.defl=2500
    export function recentrerCube(v: number = 25, t: number = 2500): boolean {
        const t0 = input.runningTime()
        while (input.runningTime() - t0 < t) {
            mettreAJourCamera()
            if (!cubeDetecte()) { moteurs_stop(); return false }

            const x = wondercam.XOfColorId(wondercam.Options.Pos_X, id_couleur)
            if (x < x_min) rotation_gauche(v)
            else if (x > x_max) rotation_droite(v)
            else { moteurs_stop(); return true }

            basic.pause(40)
        }
        moteurs_stop()
        return false
    }

    //% group="Macros PRO"
    //% blockId=msm_approcher_cube
    //% block="approcher cube (timeout(ms) %t)"
    //% t.defl=5000
    export function approcherCube(t: number = 5000): boolean {
        const t0 = input.runningTime()
        while (input.runningTime() - t0 < t) {
            mettreAJourCamera()
            if (!cubeDetecte()) { moteurs_stop(); return false }

            const y = wondercam.XOfColorId(wondercam.Options.Pos_Y, id_couleur)
            if (y < y_approche) {
                mettreAJourLigne()
                suivreLigne()
            } else {
                moteurs_stop()
                return true
            }
            basic.pause(10)
        }
        moteurs_stop()
        return false
    }

    //% group="Macros PRO"
    //% blockId=msm_cycle_pro
    //% block="cycle PRO (vitesse destination %v)"
    //% v.defl=44
    export function cyclePro(v: number = 44): void {
        // 1) mises à jour
        mettreAJourCamera()
        mettreAJourLigne()

        // 2) destination (si atteint)
        gererDestination(v)

        // 3) suivi de ligne en continu
        suivreLigne()

        // 4) si on ne porte rien et cube stable => bip + recentrer + approcher + attraper
        if (!porte_objet && cubeStable()) {
            bipValidation()

            // centrage fin (si échec, on retourne au suivi de ligne)
            if (!recentrerCube(25, 2500)) {
                compteur_stabilite = 0
                return
            }

            // approche (si cube perdu, retour)
            if (!approcherCube(5000)) {
                compteur_stabilite = 0
                return
            }

            // attraper
            attraperObjet()
            compteur_stabilite = 0
        }
    }
}

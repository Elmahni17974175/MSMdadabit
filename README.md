# MSMdadabit
# MSM AI Handler (DaDa:bit + WonderCam)

Extension MakeCode (micro:bit) pour construire le projet AI Handler :
- suivi de ligne (4 capteurs)
- détection couleur WonderCam (Color ID)
- approche + saisie + dépôt

## Dépendances
- dadabit = github:hiwonder/DaDabit
- wondercam = github:Hiwonder/WonderCam

## Utilisation (exemple)
1) On start:
- msmAIHandler.init()

2) Forever:
- msmAIHandler.updateCamera()
- msmAIHandler.updateLineSensors()
- si msmAIHandler.approachAndGrabIfColor(1) alors ...
- sinon msmAIHandler.lineFollowGeneral()

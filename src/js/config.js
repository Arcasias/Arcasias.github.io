const HUNTER = {
    img: null,
    growth: null,
    maxAmount: 1000,
    nutrition: 0,
    size: 0.2,
    species: null,
    speed: null,
    type: 'hunter',
};
const PARAMS = {
    canvas: null,
    collisions: false,
    color: [255, 0, 0],
    colorMult: 1,
    colorPtr: 2,
    colorSpeed: 1,
    cursorHidden: true,
    font: '20px Arial',
    hovered: null,
    mouse: { x: 0, y: 0 },
    mute: false,
    running: false,
};
const PREY = {
    img: null,
    maxAmount: 1000,
    nutrition: 0,
    size: 0.05,
    species: null,
    type: 'prey',
};
const SPECIES = {
    brother: {
        speech: {
            default: [
                "Bröther",
                "Bröther pls",
                "Bröther, may I have some lööps ?",
                "I beg you bröther",
                "Please bröther",
                "I'm hungry bröther",
                "Lööps",
                "Need the lööps",
                "I seek the lööps",
                "I want the lööps",
                "Just a few lööps",
                "Houston, we need the lööps",
                "Fuck I just want some lööps",
                "It's breakfast time"
            ],
            pending: [
                "Can't wait to be started !",
                "What are you waiting for ?",
                "Are you planning to let us be ?",
                "Press start bröther",
                "PRESS THAT START BUTTON FOR GOD SAKE",
                "I'm waiting",
                "I'll wait as long as I must"
            ],
            dragged: [
                "Hey !",
                "Why ?",
                "But why",
                "What have I done ?",
                "Mommy look, i'm flying",
                "You surprised me bröther",
                "Be gentle please",
                "You must put me back",
                "Put me back down !",
                "I can't get the lööps if you grab me",
                "Bröther, why have you forsaken me ?",
                "Why bröther ?",
                "Hey ! That's not nice !",
                "Why you dö dis ?",
                "Nööööööööö",
                "Stop dragging me around !",
                "Guess I won't have the lööps",
                "*Sigh*",
                "Jesus",
                "Jesus Christ",
                "Oh my god",
                "I can't believe you just did that"
            ],
            dropped: [
                "That was mean",
                "Not nice, bröther",
                "You should be ashamed",
                "Better not try this again",
                "Your actions have consequences",
                "Thanks for the ride",
                "Well... thanks I guess",
                "Hum, thank you ?",
                "Time to get these lööps",
                "Let's do this"
            ],
            seek: [
                "Seek and consume",
                "Target aquired",
                "Lööps spotted",
                "That looks tasty",
                "I want dis",
                "Our bröther has dispensed some lööps",
                "More lööps",
                "Oh boi",
                "Dinner is served",
                "This one is mine"
            ],
            found: [
                "I got the lööps !",
                "Yesss !",
                "Yummy !",
                "*Gulp*",
                "*Click* Noice",
                "The lööps have been retrieved",
                "Lööps consumed",
                "Delicious",
                "Thanks bröther"
            ],
            notfound: [
                "I'll get it next time",
                "Nooooooooo",
                "Damn",
                "I was too slow",
                "No lööps for me I guess"
            ],
            exploding: [
                "Uuuuuuuurrrrrrr",
                "I got too much lööps...",
                "Oh, here we go",
                "Mr Stark I don't feel so good..."
            ]
        },
        target: 'loops',
        sounds: [
            'sound-loops1',
            'sound-loops2',
            'sound-loops3',
        ],
    },
    antoine: {
        speech: {
            default: [
                "I'm sick, I need soup",
                "Please give soup",
                "Aaaaaaaaah",
                "What am I even doing here ?",
                "Qu'est-ce que je fous ici ?",
                "Julien arrête tes conneries",
                "I'm tired",
                "I wanna be Tracer",
                "I'm already Tracer",
                "Please I'm sick bring me soup"
            ],
            pending: [
                "Hmmmm...",
                "What are you waiting for ?",
                "Appuie sur le bouton !",
                "Le bouton ! Le bouton !"
            ],
            dragged: [
                "Ouch !",
                "Hey ! Tu fais mal à mes cheveux !",
                "Repose-moi !",
                "Aïe !",
                "Heeey !"
            ],
            dropped: [
                "C'était pas très gentil",
                "C'est bon pour une fois",
                "Je me disais bien",
                "Merci pour le trajet"
            ],
            seek: [
                "SOUP !",
                "DU POTAGE !",
                "Oh oui ! Du potage !",
                "Vite, du potage !",
                "I want this soup"
            ],
            found: [
                "Miam miam",
                "Je me sens déjà mieux",
                "Merciiii",
                "C'est gentil ça",
                "Très bonne soupe",
                "Excellent potage",
                "Ouiiiii !",
                "J'ai eu de la soupe et pas vous",
                "Je contrôle la soupe",
                "J'adore le potage"
            ],
            notfound: [
                "Pas de potage pour moi je suppose",
                "Je voulais du potage",
                "I wanted this damn soup",
                "It looked so delicious...",
                "Il reste du potage ?",
                "Elle avait l'air bonne",
                "Dommage"
            ],
            exploding: [
                "Uuuuuuuurrrrrrr",
                "Trop de souuupe",
                "Oulah je me sens pas bien",
                "J'ai mal au ventre",
                "J'ai bu trop de potage moi"
            ]
        },
        target: 'soup',
        sounds: [
            'sound-oof',
            'sound-minecraft',
        ],
    },
    julien: {
        speech: {
            default: [
                "*Click* Noice",
                "I want to die",
                "Why am I not dying ?",
                "Ravioli ravioli give me the death I deservioli",
                "Let me die please",
                "Can I commit suicide ?",
                "Give me a rope",
                "Ravioli ravioli existence is painioli",
                "Existence is pain",
                "Why am I alive ?"
            ],
            pending: [
                "Can I die already ?",
                "Hurry up and hit that start button",
                "Please start so I can die",
                "I WANNA DIE !"
            ],
            dragged: [
                "*moans*",
                "Uuuuuuuh",
                "Aaaaahhhhhh",
                "Ouh",
                "Hmmmmm...",
                "Harder daddy",
                "Oh yeah, just like that",
                "Keep it on boi"
            ],
            dropped: [
                "We were only getting started",
                "Finished already ?",
                "I like pain, do it again",
                "Again ! Again !",
                "Please strangle me harder next time"
            ],
            seek: [
                "Is that a rope ?",
                "Finally ! Death !",
                "Oh boi, a rope !",
                "Yessss !",
                "Here we go"
            ],
            found: [
                "What's this shit ? I just got bigger",
                "Hold on, what ?",
                "Uh... this isn't working",
                "Hmmm... this rope is broken"
            ],
            notfound: [
                "Lmao that fucker just got bigger",
                "HAHAHA jokes on him",
                "PTDR il est pas mort"
            ],
            exploding: [
                "YESSS ! DEATH !",
                "FINALLY ! I'M LEAVING THIS WORLD !",
                "I'M DYING !",
                "YEEEEE HAAAAAAW",
                "At long last...",
                "Farewell, friends"
            ]
        },
        target: 'rope',
        sounds: [
            'sound-julien1',
            'sound-julien2',
            'sound-julien3',
        ],
    },
    florent: {
        speech: {
            default: [
                "Je suis physicien",
                "Je vous ai déjà dit que j'étais en physique ?",
                "Ah au fait, je suis physicien",
                "Je fais des études de physique",
                "Roh, j'ai envie d'écrire des équations au tableau",
                "Est-ce que vous avez vu Schrödinger ? C'est pété ce truc",
                "Je sais pas ce que tu fais comme études, mais c'est de la merde",
                "Les ingénieurs c'est tellement des merdes",
                "Les ingés servent à rien",
                "Si c'est pas de la physique, ça sert à rien",
                "Mes études sont meilleures et plus dures que toutes les autres",
                "Quelqu'un veut jouer à quelque chose ?",
                "Vous avez pas une idée de bon jeu multi ?",
                "J'ai envie d'insulter Ophélie",
                "Ophélie kys",
                "Les ingénieurs pensent toujours avoir raison"
            ],
            pending: [
                "Bah bravo, je peux plus avancer",
                "Stop me bloquer please",
                "Si tu me fais pas avancer je te ban",
                "Je vais te péter la gueule",
                "Fais-moi avancer ou je révèle tous tes secrets"
            ],
            dragged: [
                "Hum, tu fais quoi là ?",
                "Espèce d'ingénieur",
                "Stop me drag merci",
                "Lâche-moi !",
                "Arrête de me toucher sale pédé",
                "Non mais oh"
            ],
            dropped: [
                "Si tu étais en physique je t'aurais remercié",
                "Retourne faire tes merdes d'ingénieur maintenant",
                "C'est pas ça qui va augmenter la taille de ton sexe",
                "C'est pas trop tôt",
                "On n'a pas tous autant de temps libre ici"
            ],
            seek: [
                "Attends, mais cette équation est fausse",
                "Hey ! C'est quoi ça ?",
                "Oh boi, une équation",
                "Hmmm ?",
                "Qu'est-ce que c'est que ce truc ?",
                "*Sort son marqueur et son bloc-note*"
            ],
            found: [
                "C'est pas un ingénieur qui l'aurait résolue",
                "Ouah c'était de la merde",
                "Et boum, c'est résolu",
                "Trop facile",
                "En étant physicien c'était franchement pas dur",
                "C'est pas Ophélie qui aurait pu résoudre ça"
            ],
            notfound: [
                "Bah, je suis sûr que c'était de la merde de toute façon",
                "Je laisse ça aux ingénieurs",
                "Pfff... nul",
                "Tant pis",
                "Je fais la prochaine, ok ?",
                "Je suis sûr qu'il l'a mal résolue"
            ],
            exploding: [
                "Je crois que mon ego est devenu trop gros",
                "Ma mauvaise foi déborde",
                "Mon arrogance me fait exploser",
                "Adieu, ingénieurs pathétiques",
                "Ma haine envers Ophélie est devenue trop puissante"
            ]
        },
        target: 'emc2',
        sounds: [
            'sound-chimp1',
            'sound-chimp2',
            'sound-chimp3',
            'sound-chimp4',
        ],
    }
}
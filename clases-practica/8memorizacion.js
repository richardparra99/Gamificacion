const idioma = (idioma) => (nombre) => (
    {
        "es" : "hola",
        "en" : "hello",
        "fr" : "bonjour",
        "de" : "hallo",
        "pt" : "olá",
        "it" : "ciao",
        "ru" : "привет",
        "nl" : "hallo",
        "pl" : "cześć",
        "ja" : "こんにちは",
        "ko" : "안녕하세요",
        "zh" : "你好",
        "zh-tw" : "你好",
        "zh-cn" : "你好",
    } [idioma] + nombre
    
)

const saludo = idioma("zh-cn");

console.log(saludo(" " + "joaquin"));
//clausulas 
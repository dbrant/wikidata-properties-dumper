wikidata-properties-dumper
==========================

There are now more than 1600 property ids on wikidata (less active ones though), but no handy standard json version of those, so I made one by hand, per language.
You can find `en`, `de`, `fr`, `es` and `it` versions already in the `./output` folder.

It looks like this:
```javascript
{
    "properties": {
        "P6": "head of government",
        "P7": "brother",
        "P9": "sister",
        "P10": "video",
        "P14": "highway marker",
        "P15": "road map",
        "P16": "highway system",
        "P17": "country",
        "P18": "image",

        ...
```

How To dump Properties for other languages
-------
```bash
git clone git@github.com:maxlath/wikidata-properties-dumper.git
npm install
```

then just execute the script with the wished 2 letter language code as first argument (e.g. here `fr` for French):

```bash
./wikidata-properties-dumper.js fr
```

and you're done! JSON files are waiting for you in the `output` folder:
* Properties with a label in this language, get this label
* Properties without a label in this language, get the `'en'` label and are added to the associated MissLangProp json file: yep, that's your to-complete-list


Future
-------
To get this list of properties, the script makes number_of_properties/50 requests to Wikidata API, which is kind of ugly: there should be a better one-(SQL?)query way to get this result. See [the related discussion on Wikidata](http://www.wikidata.org/wiki/Wikidata:Project_chat/Archive/2014/12#wikidata_properties_listed_in_a_JSON_file_as_key-values) for inspiration and send your PR if you can figure that out! :)


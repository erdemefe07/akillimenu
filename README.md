# Akıllı Menüm
Server Domain: [akillimenu.herokuapp.com](https://akillimenu.herokuapp.com/)

# Örnek Global Hata (500) Döndürür
```
{
  "stringValue": "\"5\"",
  "kind": "ObjectId",
  "value": 5,
  "path": "_id",
  "reason": {
    
  }
}
```

# IsletmeSchema
```
KullaniciAdi: String,
Sifre: String,
Email: String,
IsletmeAdi: String,
Adres: String
```


# Menu.*
```
Ad: String,
Fiyat: Number,
Kalori: Number,
Hazirlanma_Suresi: Number,
Aciklama: String
```


# Test endpoints

| Route | HTTP Verb | POST Body | Response          |
| ----- | --------- | :-------: | ----------------- |
| /test | `GET`     |           | "TEST ENDPOİNT"   |
| /test | `POST`    | Herhangi  | **{ POST Body }** |


# GET endpoints

| Route |   Status    | Response                                                                       |
| ----- | :---------: | ------------------------------------------------------------------------------ |
| /     |    `200`    | Bütün işletmeleri döndürür                                                     |
| /:id  | `200 | 404` | `(200)` Idsi verilen işletmeyi döndürür <br> `(404)` { "Sonuç": "Bulunamadı" } |


# POST endpoints

| Route         |   Status    | POST Body                | Response                                                                         |
| ------------- | :---------: | ------------------------ | -------------------------------------------------------------------------------- |
| /             |    `201`    | **{ IsletmeSchema }**    | Yeni işletme ekler ve eklediği işletmeyi geri döndürür                           |
| /admin-login  | `200 | 404` | { "admin": "KEY" }       | `(200)` Token döndürür <br> `(404)` Sadece 404 döndürür                          |
| /:id/Corba    |    `200`    | **{ Menu.Çorbalar }**    | Idsi verilen işletmeye yeni çorba ekler ve eklediği çorbayı geri döndürür        |
| /:id/AnaYemek |    `200`    | **{ Menu.AnaYemekler }** | Idsi verilen işletmeye yeni ana yemek ekler ve eklediği ana yemeği geri döndürür |
| /:id/Mesrubat |    `200`    | **{ Menu.Meşrubatlar }** | Idsi verilen işletmeye yeni meşrubat ekler ve eklediği meşrubatı geri döndürür   |
| /:id/Tatli    |    `200`    | **{ Menu.Tatlilar }**    | Idsi verilen işletmeye yeni tatlı ekler ve eklediği tatlıyı geri döndürür        |

# PUT ve DELETE endpoints

| HTTP Verb | Route |   Status    |       POST Body       | Response                                                                                      |
| --------- | ----- | :---------: | :-------------------: | --------------------------------------------------------------------------------------------- |
| `PUT`     | /:id  | `200 | 404` | **{ IsletmeSchema }** | `(200)` Idsi verilen işletmeyi post body ile günceller <br> `(404)` { "Sonuç": "Bulunamadı" } |
| `DELETE`  | /:id  | `200 | 404` |          ---          | `(200)` Idsi verilen işletmeyi siler<br> `(404)` { "Sonuç": "Bulunamadı" }                    |
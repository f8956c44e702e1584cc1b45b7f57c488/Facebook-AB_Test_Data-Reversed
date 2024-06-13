I will continue to reverse more parts of Facebook, such as __dyn, encpass, and more. Here is a complete list of Facebook's API "keys" and what they mean:

```js
hs_key: "__hs",
connection_class_server_guess_key: "__ccg",
dpr_key: "dpr",
spin_rev_key: "__spin_r",
spin_time_key: "__spin_t",
spin_branch_key: "__spin_b",
spin_mhenv_key: "__spin_dev_mhenv",
lite_iframe_locale_override_key: "__ltif_locale",
weblite_key: "__wblt",
weblite_iframe_key: "__wbltif",
force_touch_key: "__fmt",
kite_key: "__ktif",
kite_legacy_key: "_ktif",
haste_session_id_key: "__hsi",
jsmod_key: "__dyn",
csr_key: "__csr",
comet_key: "__comet_req"
```

# Facebook ab_test_data Reversed

Facebook's login request data contains the paramater 'ab_test_data,' this repo contains the algo's used by Facebook to encode it.

# AB_Test_data Explained

Facebook's client constantly monitors for keypresses, everytime a user presses a key, that key's keycode is stored in an array, along with the length of time they key is held. This array is then encoded into their complete 'ab_test_data,' which must be URL encoded before it's sent to Facebook's private API. The password converted into the encoded ab_test_data value must be identical to the encrypted password in the encpass param of the login request data. Facebook crossreferences these values, if they do not match, Facebook rejects the request. 

# Tools Used to Reverse 'ab_test_data'

HTTP Toolkit:
- Intercept all requests to Facebook's private API.
- Add mocking rules to the requests, allowing me to debug and manipulate client-side JS code.

WebCrack:
- Deobfuscate, unminify, and mangle variables.
- Make's obfuscated, unreadable code readable. 

ChatGPT: 
- GPT4o is very good at analyzing raw client-side JS code, and tracing functions to their origional source. 
- Great at finding logic for encoding values.

# Facebook Login Endpoint

POST `https://www.facebook.com/login/device-based/regular/login/`

# Contact

Telegram - @Hartman50
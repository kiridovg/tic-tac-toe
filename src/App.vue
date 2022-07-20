<template>
  <router-view></router-view>
</template>


<script>
export default {
  data() {
    return {};
  },
  methods: {},
};
</script>

<style>
* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

html {
  font-family: "Jost", sans-serif;
  height: 100%;
}

body {
  background: #ffffff no-repeat fixed;
  padding-bottom: 20px;
}

body,
p {
  margin: 0;
}

h1 {
  font-family: "Irish Grover", cursive;
  text-align: center;
  font-size: 36px;
  padding: 15px 0;
  background: linear-gradient(180deg, #f8f8f8 0%, #fffcf7 27.6%, #fdebae 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

h2 {
  font-family: "Koulen", cursive;
  font-weight: normal;
  text-align: center;
  color: #46cbb3;
  font-size: 32px;
  padding: 15px;
}

.form-style li {
  padding: 0;
  display: block;
  list-style: none;
  margin: 10px 0 0 0;
}

.form-style label {
  margin: 0 0 3px 0;
  padding: 0px;
  display: block;
  font-weight: bold;
}

#chat input[type="text"],
.form-style input[type="text"],
.form-style input[type="date"],
.form-style input[type="datetime"],
.form-style input[type="number"],
.form-style input[type="search"],
.form-style input[type="time"],
.form-style input[type="url"],
.form-style input[type="email"],
textarea,
select {
  box-sizing: border-box;
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  border: none;
  padding: 7px;
  margin: 0px;
  transition: all 0.3s ease-in-out;
  -webkit-transition: all 0.3s ease-in-out;
  -moz-transition: all 0.3s ease-in-out;
  -ms-transition: all 0.3s ease-in-out;
  -o-transition: all 0.3s ease-in-out;
  outline: none;
  border-top-left-radius: 5px;
  border-bottom-left-radius: 5px;
  border-top: 2px solid #46cbb3;
  border-bottom: 2px solid #46cbb3;
  border-left: 2px solid #46cbb3;
}

.form-style .field-divided {
  width: 49%;
}

.form-style .field-long {
  width: 100%;
}

.form-style .field-select {
  width: 100%;
}

.form-style .field-textarea {
  height: 100px;
}

button {
  background: #46cbb3;
  padding: 9px 15px 9px 15px;
  border: none;
  color: #fff;
  border-radius: 5px;
}

button:hover {
  background: #2db29a;
  box-shadow: none;
  -moz-box-shadow: none;
  -webkit-box-shadow: none;
  cursor: pointer;
}

.form-style button {
  margin: 15px 10px 15px auto;
}

/*Breakpoints*/
@media (min-width: 576px) {
  h1 {
    font-size: 48px;
  }
}

@media (min-width: 768px) {
  h1 {
    font-size: 60px;
  }
}
</style>
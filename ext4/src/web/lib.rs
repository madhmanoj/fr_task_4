// Making a function pub makes it an export in the .wasm file
#[no_mangle]
pub extern "C" fn _start() {
    unsafe {
        hello_world();
        println!("After Hello!");
    }
}

#[link(wasm_import_module = "module1")]
extern "C" {
    fn hello_world();
}

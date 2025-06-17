
// Making a function pub makes it an export in the .wasm file
#[no_mangle]
pub extern "C" fn main() {
    unsafe {
        hello_world();
    }
}

extern "C" {
    fn hello_world();
}

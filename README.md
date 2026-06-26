<div align="center">
  <img src="public/image-markdown/pltb.gif" alt="Contoh Gambar" style="width:100%; heigh:30%; object-fit:cover">
</div>

<div align="center">
  <pre color="blue">
    <h1>MANUAL USER GUIDE</h1>                                             
  </pre>
</div>




---

# Feature:
1. Forecasting Data ( 7 Hari )
2. Analytics Data ( Real-time data )
3. Upgrade Feature For User With Payment Gateway
4. Limitation For User 
5. Restore Snapshot For Generate 
6. Edit Profile 


---

# Step Guide For User 
## Forecasting Page 
### Training dan Generate Data 
1. Untuk di awal untuk metrics nya tidak ada, karna sudah di setting idle dulu agar tidak memberatkan servernya
2. Upload Data berdasarkan dari template yang sudah memiliki validasi kolom yang sudah di sediakan 
3. Terus tunnggu sekitar 40-50 Menit untuk Training data, dikarnakan dari banyak data yang di training per satu atribut.
4. Setelah selesai di training, maka pengguna bisa memilih atribut yang ingin diforcesting ataupun bisa memilih best model untuk melakukan forecasting di semua atribut yang tersedia.
5. Setelah berhasil di generate, maka user bisa mengunduh data yang sudah di generate dan bisa melihat Ringkasan Summary dari NLP. 
6. User bisa melihat Overview yang berisi semua summary data dan juga Exploratory Data Analysis beserta Overfit Chart dan Prediksi vs Aktual Data
7. User bisa memilih untuk menyimpan data yang sudah di train dan ter generate

### Restore & Generate 
1. Untuk di awal untuk metrics nya tidak ada, karna sudah di setting idle dulu agar tidak memberatkan servernya
2. Jika user ingin menggunakan restore pada salah satu data yang sudah di training dan generate, maka bisa restore untuk salah satu data yang diinginkan, lalu generate.
4. Setelah berhasil di generate, maka user bisa mengunduh data yang sudah di generate dan bisa melihat Ringkasan Summary dari NLP. 
5. User bisa melihat Overview yang berisi semua summary data dan juga Exploratory Data Analysis beserta Overfit Chart dan Prediksi vs Aktual Data
6. User bisa memilih untuk menyimpan data yang sudah di train dan ter generate

---

## Analytics Page 
1. User Bisa mencari Daerah yang diinginkan semisal Depok, lalu website akan mengambil data 7 hari yang akan di sediakan untuk user 
2. Setelah berhasil mendapatkan data Real-time nya, use bisa melihat data dua card section yang satu **Arah Angin** dan satu lagi **Data Lengkap Cuaca**, beserta dengan Detail & Analisis Card yang dimana berisi sebuah ringkasan berita, juga memiliki Pipeline Validasi & Akurasi Pada Algoritma yang digunakan dalam proses Natural Language Processing.

---

## More Feature 

## Histories Page 
1. User di perlihatkan sebuah data table histories forecasting, yang dimana itu sebuah hasil dari data yang sudah di train dan generate
2. User bisa mengunduh ataupun menghapus data yang sudah tersimpan di halaman historis 

### Histories Payment Page 
1. Di sini user bisa melihat pembayaran apa saja yang sudah dilakukan saat ingin meng-upgrade layanan yang disediakan.

### Settings 
1. Pada Section **Edit Profile**, user bisa mengubah data profile masing-masing user seperti username, password, profile, dan gmail. 
2. Di Section **Manage Cache Section**, user bisa menonaktifkan / mengaktifkan Cache per setiap upload data. 
3. Di Section **Manage Snapshot**, per tiap user yang memiliki tier **gratis** memiliki dua snapshot dan untuk tier **basic** memiliki 3 snapshot untuk melakukan restore yang sudah di train dan generate. Ketika Snapshot itu penuh pada saat melakukan forecasting, maka ada dua pilihan **menghapus** atau **restore** snapshot yang ada.



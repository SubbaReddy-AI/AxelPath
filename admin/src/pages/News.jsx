import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import { createAdminItem, deleteAdminItem, getAdminList, updateAdminItem } from "../api/adminApi";

const emptyNews = {
  title: "", slug: "", excerpt: "", content: "",
  category: "", author: "", published: false,
};

export default function News() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyNews);
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);

  const loadItems = async () => {
    const data = await getAdminList("/news");
    setItems(data.items || data);
  };

  useEffect(() => { loadItems(); }, []);

  const save = async (event) => {
    event.preventDefault();
    if (editing) await updateAdminItem("/news", editing.id, form);
    else await createAdminItem("/news", form);

    setOpen(false);
    setEditing(null);
    setForm(emptyNews);
    loadItems();
  };

  const remove = async (item) => {
    if (!window.confirm(`Delete "${item.title}"?`)) return;
    await deleteAdminItem("/news", item.id);
    loadItems();
  };

  return (
    <div className="admin-layout">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="admin-main">
        <Header title="News" subtitle="Publish and manage AxelPath news." onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <div className="admin-page-content">
          <button className="admin-primary-button admin-add-button" onClick={() => { setEditing(null); setForm(emptyNews); setOpen(true); }}><Plus size={18} /> Add News</button>
          <DataTable
            data={items}
            onEdit={(item) => { setEditing(item); setForm({ ...emptyNews, ...item }); setOpen(true); }}
            onDelete={remove}
            columns={[
              { key: "title", label: "Title" },
              { key: "category", label: "Category" },
              { key: "author", label: "Author" },
              { key: "published", label: "Published", render: (row) => row.published ? "Yes" : "Draft" },
            ]}
          />
        </div>
      </main>

      <Modal open={open} title={editing ? "Edit News" : "Add News"} onClose={() => setOpen(false)}>
        <form className="admin-form" onSubmit={save}>
          <label>Title<input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
          <label>Slug<input required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></label>
          <label>Category<input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></label>
          <label>Author<input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} /></label>
          <label>Excerpt<textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} /></label>
          <label>Content<textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} /></label>
          <label className="checkbox-label"><input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} /> Publish now</label>
          <button className="admin-primary-button" type="submit">Save News</button>
        </form>
      </Modal>
    </div>
  );
}
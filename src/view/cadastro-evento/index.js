/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import firebase from "../../config/firebase";
import "firebase/auth";

import "./cadastro-evento.css";

//Components
import Navbar from "../../components/navbar";

function CadastroEvento(props) {
    const [carregando, setCarregando] = useState();
    const [msgTipo, setMsgTipo] = useState();
    const [titulo, setTitulo] = useState();
    const [tipo, setTipo] = useState();
    const [detalhes, setDetalhes] = useState();
    const [data, setData] = useState();
    const [hora, setHora] = useState();
    const [fotoAtual, setFotoAtual] = useState();
    const [fotoNova, setFotoNova] = useState();

    //pega o usuario da store e salva no estado usuarioEmail
    const usuarioEmail = useSelector((state) => state.usuarioEmail);

    const storage = firebase.storage();
    const db = firebase.firestore();

    useEffect(() => {
        if (props.match.params.id) {
            //resgata o evento de acordo com o id e guarda no resultado
            firebase
                .firestore()
                .collection("eventos")
                .doc(props.match.params.id)
                .get()
                .then((resultado) => {
                    setTitulo(resultado.data().titulo);
                    setTipo(resultado.data().tipo);
                    setDetalhes(resultado.data().detalhes);
                    setData(resultado.data().data);
                    setHora(resultado.data().hora);
                    setFotoAtual(resultado.data().foto);
                });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [carregando]);

    function atualizar() {
        setMsgTipo(null);
        setCarregando(1);

        if (fotoNova) {
            storage.ref(`imagens/${fotoNova.name}`).put(fotoNova);
        }

        db.collection("eventos")
            .doc(props.match.params.id)
            .update({
                titulo: titulo,
                tipo: tipo,
                detalhes: detalhes,
                data: data,
                hora: hora,
                foto: fotoNova ? fotoNova.name : fotoAtual,
            })
            .then(() => {
                setMsgTipo("sucesso");
                setCarregando(0);
            })
            .catch((erro) => {
                setMsgTipo("erro");
                setCarregando(0);
            });
    }

    function cadastrar() {
        setMsgTipo(null);
        setCarregando(1);

        storage
            .ref(`imagens/${fotoNova.name}`)
            .put(fotoNova)
            .then(() => {
                db.collection("eventos")
                    .add({
                        titulo: titulo,
                        tipo: tipo,
                        detalhes: detalhes,
                        data: data,
                        hora: hora,
                        usuario: usuarioEmail,
                        visualizacoes: 0,
                        foto: fotoNova.name,
                        publico: 1,
                        criacao: new Date(),
                    })
                    .then(() => {
                        setMsgTipo("sucesso");
                        setCarregando(0);
                    })
                    .catch((erro) => {
                        setMsgTipo("erro");
                        setCarregando(0);
                    });
            });
    }

    return (
        <>
            <Navbar />
            <div className="container mt-5">
                <div className="row">
                    <h3 className="mx-auto font-weight-bold">
                        {props.match.params.id ? "Atualizar evento" : "Novo evento"}
                    </h3>
                </div>

                <form>
                    <div className="form-group">
                        <label>Titulo:</label>
                        <input
                            onChange={(e) => setTitulo(e.target.value)}
                            type="text"
                            className="form-control"
                            value={titulo && titulo}
                        />
                    </div>

                    <div className="form-group">
                        <label>Tipo do Evento:</label>
                        <select onChange={(e) => setTipo(e.target.value)} className="form-control" value={tipo && tipo}>
                            <option disabled selected value>
                                -- Selecione um tipo --
                            </option>
                            <option>Festa</option>
                            <option>Teatro</option>
                            <option>Show</option>
                            <option>Evento</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Descrição do evento:</label>
                        <textarea
                            onChange={(e) => setDetalhes(e.target.value)}
                            className="form-control"
                            rows="3"
                            value={detalhes && detalhes}
                        />
                    </div>

                    <div className="form-group row">
                        <div className="col-6">
                            <label>Data:</label>
                            <input
                                onChange={(e) => setData(e.target.value)}
                                type="date"
                                className="form-control"
                                value={data && data}
                            />
                        </div>
                        <div className="col-6">
                            <label>Hora:</label>
                            <input
                                onChange={(e) => setHora(e.target.value)}
                                type="time"
                                className="form-control"
                                value={hora && hora}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>
                            Upload da foto{" "}
                            {props.match.params.id
                                ? "(caso queira manter a foto atual, não precisa anexar uma nova imagem)"
                                : null}
                            :
                        </label>
                        <input onChange={(e) => setFotoNova(e.target.files[0])} type="file" className="form-control" />
                    </div>

                    <div className="row d-flex justify-content-center">
                        {carregando > 0 ? (
                            <Spinner className="mx-auto" animation="border" variant="danger" role="status">
                                <span className="sr-only">Loading...</span>
                            </Spinner>
                        ) : (
                            <button
                                onClick={props.match.params.id ? atualizar : cadastrar}
                                type="button"
                                className="btn btn-lg mt-3 mb-5 btn-cadastro"
                            >
                                {props.match.params.id ? "Atualizar evento" : "Publicar evento"}
                            </button>
                        )}
                    </div>
                </form>

                <div className="msg-login text-center mt-2">
                    {msgTipo === "sucesso" && (
                        <span>
                            <strong>Wow!</strong> Evento publicado! &#129304;
                        </span>
                    )}
                    {msgTipo === "erro" && (
                        <span>
                            <strong>Ops!</strong> Não foi possível publicar o evento! &#128078;
                        </span>
                    )}
                </div>
            </div>
        </>
    );
}

export default CadastroEvento;
